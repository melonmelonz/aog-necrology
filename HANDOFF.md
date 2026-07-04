# Continuing the Necrology — a runbook for Claude Code

**Point your AI assistant at this file.** It explains, end to end, how to
transcribe more of the West Point necrology and publish it. Everything is
resumable and safe to run in small batches — you cannot lose finished work.

- **Live site:** https://melonmelonz.github.io/aog-necrology/ (auto-deploys on every push to `main`)
- **The record so far:** run `python pipeline/status.py`
- **Full background for agents:** `CLAUDE.md` (read it once) and the extraction
  contract `pipeline/extraction-spec.md` (the rules for what a record is)

---

## The one loop

The work is transcribing **chunks** (each ~60 pages of one annual report) into
person records. A chunk is "done" when its file exists in
`data/extracted/parts/`, so stopping at any time loses nothing.

```bash
# 1. See what's left (chunks, not years):
python pipeline/todo.py --count          # e.g. "done 21 / total 258, todo 237"

# 2. Take a WAVE — a small slice of the todo list (25–40 chunks is plenty):
python pipeline/todo.py                   # prints [[year,start,end], ...]

# 3. Run the wave with the extraction workflow (agents on 'sonnet'):
#    From a Claude Code session, call the Workflow tool:
#    Workflow({ scriptPath: "<abs>/pipeline/extract.workflow.js", args: <your slice> })

# 4. Fold the results in and refresh the site + downloads:
python pipeline/merge.py && python pipeline/build_db.py && python pipeline/site_data.py

# 5. Publish (the live site rebuilds itself in ~1 minute):
git add -A && git commit -m "Extraction wave: <years>" && git push
```

Then repeat from step 1 until `todo.py --count` shows `todo 0`.

---

## Dividing the work (so we don't collide)

Two people can transcribe at once — `todo.py` skips anything already done, so
there's no conflict. To stay out of each other's way:

- **Calvin's side works the OLDER years forward** — the *front* of the todo list
  (1871, 1874, 1878, …).
- **Kit's side takes the NEWER years** — the *end* of the todo list. Grab the
  last ~30 chunks instead of the first:

  ```bash
  python -c "import json,subprocess; t=json.loads(subprocess.check_output(['python','pipeline/todo.py'])); print(json.dumps(t[-30:]))"
  ```

  Feed that slice to the workflow. Commit and push when the wave lands.

Whoever finishes their end first just keeps taking slices from their side until
they meet in the middle.

---

## The five rules (a past session burned ~2M tokens ignoring them)

1. **Small waves, not one blast.** 25–40 chunks per Workflow call. If a usage or
   session limit trips, *every* in-flight and queued agent fails at once — a
   250-agent run becomes total loss. Small waves bound the damage; finished
   chunks are already on disk.
2. **Run agents on `sonnet`.** This is careful spec-following, not reasoning.
   Opus drains the cap fast; sonnet is cheap and accurate. (Already set in
   `pipeline/extract.workflow.js`.)
3. **Checkpoint between waves.** After each wave, confirm the parts landed
   (`ls data/extracted/parts | wc -l`) before spending on the next. If a wave
   comes back mostly failed, **stop and wait for the limit to reset** — don't
   fire into a live wall.
4. **Follow `pipeline/extraction-spec.md` exactly.** Light OCR corrections only;
   never paraphrase; keep the original in `*_raw` fields; **skip the cumulative
   Register of Graduates** (it repeats every year and would mass-duplicate).
5. **Never hand-edit generated files.** `dist/*`, `site/public/data/*`, and the
   merged `data/extracted/{year}.json` are all rebuilt by the pipeline — change
   the source and re-run steps 4–5 above.

---

## Checking quality

- `python pipeline/status.py` — how many records, which years.
- Spot-check a year: open `data/extracted/{year}.json` and read a few entries
  against the scan (each record's `obit_link` opens the original page).
- Entries with poor OCR are marked `confidence: "low"` or `needs_vision: true`
  and surface on the site as "flagged for review" — those are the ones worth a
  human's eyes later.

## If you get stuck

- Workflow won't launch → make sure `export const meta` is the **first**
  statement in `extract.workflow.js`, and that your slice is a JSON array.
- `todo.py` shows 0 but a year looks thin → that year's front chunk (`_p001-060`)
  may have been a register/roster page correctly yielding few records; confirm
  against the scan before re-running.
- The site didn't update → check the Pages build:
  `gh run list --workflow=pages.yml --limit 1`.
