# CLAUDE.md — working brief for AI agents on this repo

This file is context for Claude Code (and any coding agent). Read it first.
The human-facing overview is in `README.md`; this file is how to *work* here.

## What this project is

A database and static search site for **every obituary and death notice**
published in the U.S. Military Academy (West Point) **Association of Graduates
annual reports, 1870–1941** — 72 reports, one per year, digitized in the
[USMA Digital Library](https://usmalibrary.contentdm.oclc.org/digital/collection/aogreunion/search)
(CONTENTdm collection `aogreunion`).

Deliverable: a searchable, source-linked register of the dead — not a
genealogy service, not editable CAD/BIM. Every record links back to the
scanned page it came from.

## Repo layout

```
pipeline/            the data pipeline (Python) + the extraction workflow (JS)
  harvest.py           download PDFs + per-page OCR text + page->pointer maps
  chunk.py             split each year into ~60-page chunks for extraction agents
  extraction-spec.md   THE contract for what a record is — agents must follow it
  extract.workflow.js  Claude Code workflow: one subagent per chunk (see below)
  todo.py              prints chunks still needing extraction (resume helper)
  merge.py             fold data/extracted/parts/*.json into per-year files
  build_db.py          compile per-year files -> dist/necrology.{sqlite,csv,json}
  site_data.py         split dist/necrology.json -> site/public/data/* for the site
  status.py            harvest/extraction progress report
db/schema.sql        Postgres/Supabase schema (FTS, RLS) for a future hosted DB
data/                working data — most of it is gitignored (see below)
  extracted/           the durable output: {year}.json (merged) + parts/ (raw)
dist/                generated exports (committed): necrology.{sqlite,csv,json}
site/                static Next.js 16 search site (App Router, output: 'export')
  src/app/register.tsx  the whole UI: client-side search over public/data/index.json
```

### What is and isn't in git

Committed: all code, `pipeline/`, `db/`, `data/extracted/` (the real output),
`dist/` exports, `site/` source + `site/public/data/`.

Gitignored (regenerable, large): `data/pdfs/` (~1 GB), `data/pages/`,
`data/chunks/`, `data/compound/`, `site/node_modules/`, `site/.next/`,
`site/out/`. To rebuild them from scratch: `python pipeline/harvest.py` then
`python pipeline/chunk.py` (harvest re-downloads from the USMA Digital Library).

## The pipeline, end to end

```
harvest.py   -> data/pdfs/{year}.pdf, data/pages/{year}.jsonl, data/compound/{year}.json
chunk.py     -> data/chunks/{year}_pSTART-END.txt + manifest.json
extract      -> data/extracted/parts/{year}_pSTART-END.json   (LLM, see below)
merge.py     -> data/extracted/{year}.json
build_db.py  -> dist/necrology.{sqlite,csv,json}
site_data.py -> site/public/data/index.json + years/{year}.json
```

Everything downstream of extraction is deterministic and cheap. After ANY
extraction batch, the refresh is just:

```bash
python pipeline/merge.py && python pipeline/build_db.py && python pipeline/site_data.py
```

Record IDs are `uuid5` derived from source fields, so rebuilds don't churn IDs.

## Extraction — the one expensive, careful step

Extraction turns chunk text into person records. It is done by Claude subagents
following `pipeline/extraction-spec.md` exactly. **Read that spec** before
touching extraction — it defines the record schema, the light-corrections
policy (fix OCR, never paraphrase; keep `*_raw` fields), what to SKIP (the
cumulative Register of Graduates repeats every year and would mass-duplicate),
and the confidence/`needs_vision` flags that drive review.

### How to run / resume it

1. `python pipeline/todo.py --count` — see how many chunks remain.
2. Set `ROOT` at the top of `pipeline/extract.workflow.js` to your checkout path.
3. Launch a **wave** from a Claude Code session:
   ```
   Workflow({ scriptPath: "<abs>/pipeline/extract.workflow.js",
              args: <a slice of `python pipeline/todo.py` output> })
   ```
4. When it returns, run the merge/build/site_data refresh above, commit, repeat.

`todo.py` decides "done" by whether the part file exists, so extraction is
always resumable — a crashed or rate-limited wave loses nothing already written.

### Hard-won rules (a previous session burned ~2M tokens ignoring these)

- **Waves, not one blast.** Do ~20–40 chunks per invocation, not all ~250.
  When a usage/session limit trips, every in-flight AND queued agent fails at
  once — a single limit-hit turns a 250-agent run into total loss. Small waves
  bound the damage and checkpoint to disk between them.
- **Run agents on `sonnet`.** This is mechanical spec-following; Opus drains the
  cap fast and Fable has a low ceiling. Sonnet is cheap and accurate here.
  (Set via `model: 'sonnet'` in the agent opts — already in the script.)
- **Checkpoint between waves.** After each wave, confirm parts landed
  (`ls data/extracted/parts | wc -l`) before spending on the next. If a wave
  comes back mostly-failed, STOP and wait for the limit to reset — do not
  re-fire into a live wall.
- **`args` may arrive as a JSON string.** The workflow parses it; keep that.

## The site

`site/` is a **static** Next.js 16 App-Router app (`output: 'export'`), no
backend. Routes:
- `/` (`src/app/page.tsx`) — marketing **landing page**: value-prop headline,
  CTA, specimen visual, the four-stage workflow, live-demo band. This is the
  client-facing pitch; the AOG necrology is its live demo/case study.
- `/archive` (`src/app/archive/page.tsx`) — the **search tool** (the register).

`src/app/register.tsx` is the search UI: it fetches `public/data/index.json`
(a compact search index of every record), searches it client-side (name, class,
Cullum number, place of death, year), and lazy-fetches
`public/data/years/{year}.json` for the full record when a row is expanded.
`src/app/exports.ts` powers the one-click **export toolbar** — CSV, JSON,
Markdown, and Print/PDF of the current filtered results, generated in-browser.

Deployment: see `DEPLOY.md` (Cloudflare Pages, root serving, `AOG_BASE_PATH`
unset; or GitHub Pages via `.github/workflows/pages.yml`, subpath serving).
Client collateral (proposal, service agreement — no pricing) lives in `business/`.

Design is deliberate and documented in the code/commit — archival register:
rag-paper palette, Old Standard TT small-caps names on dotted leader lines,
double rules, Cullum numbers in the margin, gold accent. Keep it restrained;
the register itself is the signature. Quality floor: responsive, keyboard
focus visible, reduced-motion respected.

- Dev: `cd site && npm install && npm run dev`
- Build static: `cd site && npm run build` → `site/out/`
- Note: `site/AGENTS.md` warns this Next.js has breaking changes vs training
  data — check `site/node_modules/next/dist/docs/` before writing Next code.
- Refresh data after extraction with `python pipeline/site_data.py` (do NOT
  hand-edit `site/public/data/*`).

## Conventions

- Python: stdlib only, `pathlib`, top-of-file docstring explaining the step.
- Never hand-edit generated files (`dist/*`, `site/public/data/*`,
  `data/extracted/{year}.json`) — regenerate them.
- Never paraphrase obituary text anywhere; the value is faithful transcription.
- Commit messages: what changed and why; co-author trailer if AI-assisted.

## Current state

See `python pipeline/status.py`. As of the initial build: all 72 reports
harvested and chunked; extraction in progress wave-by-wave (1870 is a
hand-checked pilot). When `todo.py --count` shows 0 remaining, the dataset is
complete — do the final merge/build/site_data, commit, and the site is ready
to deploy (a GitHub Pages workflow is in `.github/workflows/`).
