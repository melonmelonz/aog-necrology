# Necrology of the Association of Graduates, U.S.M.A. · 1870–1941

A memorial record of graduates of the United States Military Academy whose
deaths were reported to the **Association of Graduates** at its annual reunions,
**1870–1941** — every obituary and death notice, transcribed from the printed
reports, searchable, and linked back to the original scanned page.

**Live site → https://melonmelonz.github.io/aog-necrology/**

This repository is both the finished record *and* the open pipeline that built
it: it harvests the scans, transcribes each page, compiles a database, and
publishes the search site. Anyone can run it, extend it to more years, or
rebuild it from scratch.

---

## What you can do with it

- **Search** every graduate by name, class, Cullum number, or place of death.
- **Read** the full memorial, with the original text kept faithfully and a link
  to the scanned page in the USMA Digital Library.
- **Print a memorial** — a single graduate, a whole year's report, or the entire
  necrology — typeset as a dignified PDF document.
- **Download the whole database** — SQLite (full-text searchable), CSV, or JSON.

The database schema is a superset of the site's needs, with reserved fields for
future work (`class_crest`, `date_of_birth`, `images`) and a `draft/published`
review workflow (`db/schema.sql`) for a future hosted version.

---

## Repository layout

```
pipeline/            the data pipeline (Python) + the extraction workflow (JS)
  harvest.py           download report PDFs + per-page text + page→scan maps
  chunk.py             split each year into ~60-page chunks for extraction
  extraction-spec.md   THE rulebook for what a record is (agents follow it exactly)
  extract.workflow.js  Claude Code workflow: one AI agent per chunk
  todo.py              which chunks still need extraction (resume helper)
  merge.py             fold chunk outputs into one file per year
  build_db.py          compile per-year files → dist/necrology.{sqlite,csv,json}
  site_data.py         split the dataset into the site's search index + downloads
  status.py            harvest / extraction progress report
db/schema.sql          Postgres/Supabase schema (FTS, RLS) for a hosted version
data/extracted/        the durable output: {year}.json (+ raw parts/)
dist/                  generated exports: necrology.{sqlite,csv,json}
site/                  the static Next.js search site (App Router, output:'export')
DEPLOY.md              how the live site is published
```

## The pipeline, end to end

```
harvest.py   →  data/pdfs/{year}.pdf, data/pages/{year}.jsonl
chunk.py     →  data/chunks/{year}_pSTART-END.txt
extract      →  data/extracted/parts/{chunk}.json   (AI, per extraction-spec.md)
merge.py     →  data/extracted/{year}.json
build_db.py  →  dist/necrology.{sqlite,csv,json}
site_data.py →  site/public/data/* + site/public/download/*
```

Everything downstream of extraction is deterministic and cheap. After any
extraction batch, refresh the whole record with:

```bash
python pipeline/merge.py && python pipeline/build_db.py && python pipeline/site_data.py
```

Record IDs are `uuid5` derived from source fields, so rebuilds never churn IDs.

---

## Working on it (for Kit)

> **Continuing the transcription?** Point your Claude at **[`HANDOFF.md`](HANDOFF.md)** —
> it is the complete, self-contained runbook for extracting more years and
> publishing them, including how to split the work so two people don't collide.

The repo is on GitHub at **github.com/melonmelonz/aog-necrology** and the site
**auto-deploys on every push to `main`** (GitHub Pages — see `DEPLOY.md`). So the
loop is: change, commit, push, and the live site rebuilds itself in ~1 minute.

**The search site** (`site/`) is a static Next.js app — no backend.

```bash
cd site
npm install
npm run dev      # http://localhost:3000  (edit and see changes live)
npm run build    # static export → site/out/
```

- `src/app/page.tsx` — the frontispiece (title page).
- `src/app/archive/page.tsx` + `src/app/register.tsx` — the search register.
- `src/app/exports.ts` — the print-a-memorial and data-export engine.
- `src/app/globals.css` — the entire visual design ("The Long Gray Line").
- Design intent lives in `site/CLAUDE.md` / `AGENTS.md`. Do **not** hand-edit
  anything under `site/public/data/` or `dist/` — those are generated; run
  `python pipeline/site_data.py` instead.

**Adding more years of records** (extraction is currently paused at 1870–1887):

```bash
python pipeline/todo.py --count           # how many chunks remain
# feed a wave (~25–40 chunks) of `python pipeline/todo.py` to the workflow:
#   Workflow({ scriptPath: "pipeline/extract.workflow.js", args: <wave slice> })
python pipeline/merge.py && python pipeline/build_db.py && python pipeline/site_data.py
git add -A && git commit -m "…" && git push     # live site refreshes
```

Extraction is resumable at any time — a chunk is "done" when its part file
exists, so a stopped or rate-limited wave loses nothing. Run agents on `sonnet`
and in small waves; the reasons are documented in `pipeline/extract.workflow.js`
and `CLAUDE.md`.

---

## Source & editorial policy

Scans and the underlying OCR come from the [USMA Digital Library](https://usmalibrary.contentdm.oclc.org/digital/collection/aogreunion/search)
(CONTENTdm collection `aogreunion`, 72 annual reports). Transcriptions are
**lightly corrected only** — obvious OCR errors fixed, names and dates kept as
printed, prose never paraphrased. Original strings are preserved in `*_raw`
fields, and each record carries a self-reported `confidence` flag. The
cumulative *Register of Graduates* printed in each report is deliberately
skipped (it repeats every year); only the year's necrology is recorded.

This project is an independent memorial and is not affiliated with, or endorsed
by, the United States Military Academy or the Association of Graduates.
