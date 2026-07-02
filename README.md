# AOG Necrology

A database and search site for every obituary and death notice published in the
USMA **Association of Graduates annual reports, 1870–1941** (72 reports, one per
year), digitized in the [USMA Digital Library](https://usmalibrary.contentdm.oclc.org/digital/collection/aogreunion/search).

## Key facts (researched 2026-07-02)

- 72 compound objects in CONTENTdm collection `aogreunion`, one per year,
  complete run 1870–1941. Roughly 12–14k pages total.
- **OCR already exists**: every page has a transcript in CONTENTdm and the
  downloadable PDFs carry the same embedded text layer. No OCR pass needed;
  vision (IIIF page images) is used only as fallback for garbled pages.
- Full report PDF: `https://usmalibrary.contentdm.oclc.org/digital/api/collection/aogreunion/id/{pointer}/download`
- Page image (IIIF): `https://usmalibrary.contentdm.oclc.org/digital/iiif/2/aogreunion:{page_pointer}/full/800,/0/default.jpg`
- Deep link per page: `https://usmalibrary.contentdm.oclc.org/digital/collection/aogreunion/id/{page_pointer}`
- **Structure varies by era**: in early reports (1870s) death notices and
  eulogies are embedded inside the Minutes of the Business Meeting; later
  reports have a dedicated obituary section. Every report also carries a
  cumulative Register of Graduates (all graduates ever, living and dead) —
  the pipeline must SKIP it or every dead graduate duplicates ~70 times.

## Pipeline

```
pipeline/harvest.py         download PDFs + page maps, extract per-page text
                            -> data/pdfs/{year}.pdf, data/pages/{year}.jsonl,
                               data/compound/{year}.json
(LLM structuring pass)      Claude agents follow pipeline/extraction-spec.md
                            -> data/extracted/{year}.json
pipeline/build_db.py        compile all extracted years
                            -> dist/necrology.{sqlite,csv,json}
db/schema.sql               Postgres/Supabase schema (FTS, RLS, draft/published)
```

Extraction decisions (locked in):
- Entry scope: full obituaries AND brief death notices, distinguished by
  `entry_type`; the year's necrology only, never the cumulative register.
- No dedup at extraction time; merge later keyed on `cullum_number`
  (a death_notice one year may be followed by a full obituary the next).
- Light corrections only (OCR errors, dehyphenation); never paraphrase.
  Original strings kept in `*_raw` fields. Self-reported `confidence` +
  `needs_vision` flag drive the review queue.
- Extraction runs in Claude Code sessions (no separate API billing),
  batched over multiple sessions.

## Site

Static Next.js export in `site/` — no backend required. `pipeline/site_data.py`
splits `dist/necrology.json` into `site/public/data/index.json` (compact search
index) plus per-year record files; the register page searches the index
client-side (name, class, Cullum number, place of death) and fetches a year
file when a record is opened. Every record links back to the scanned page in
the USMA Digital Library.

```
python pipeline/site_data.py   # refresh site data from dist/
cd site && npm install && npm run build   # static site -> site/out/
```

`db/schema.sql` (Postgres/Supabase, FTS + draft/published workflow) is kept
for a future hosted-database version. Reserved columns: `class_crest`,
`date_of_birth`, `images`.
