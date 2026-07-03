# Proposal — Searchable Digital Archive

**Prepared for:** [Client / Institution name]
**Prepared by:** [Your studio name] · [contact email] · [date]
**Re:** Digitization and searchable-archive build for [collection name]

---

## 1. The opportunity

[Client] holds [describe the collection: e.g. "72 annual reports, 1870–1941,
roughly 13,000 pages"]. Today the material is [scanned images / bound volumes /
PDFs] that can only be read one page at a time — there is no way to search across
it, pull a record, or link to a source page. The knowledge is preserved but not
*findable*.

We turn that collection into a **searchable, source-linked digital archive**: a
clean public website where anyone can search every name, date, and passage in
seconds, and every result links straight back to the scanned original.

## 2. What you get

- **A structured dataset** — every [record type, e.g. obituary / entry / person]
  extracted into consistent fields (names, dates, places, classifications, full
  transcribed text), delivered as SQLite, CSV, and JSON you own outright.
- **A public search site** — fast, archival, mobile-friendly; search by any field,
  open a full record, and jump to the scanned page it came from.
- **One-click exports** — visitors and staff can export search results in multiple
  document formats (CSV, JSON, Markdown, print/PDF) for research and reuse.
- **The source images** organized and linked, with a documented pipeline so the
  archive can be extended to future volumes without starting over.

## 3. Our approach

A four-stage pipeline, proven on the [reference/demo] collection:

1. **Harvest** — retrieve the source scans and their existing OCR text; build a
   page-to-source map so every extracted record can link back to its origin.
2. **Structure** — AI extraction reads each page and pulls records into a strict,
   reviewed schema. Original text is preserved verbatim; only obvious OCR errors
   are corrected, and every record carries a confidence flag for review.
3. **Compile** — records are merged and de-duplicated into the dataset and its
   exports (SQLite with full-text search, CSV, JSON).
4. **Publish** — a static, low-maintenance website is generated from the dataset
   and deployed to your domain.

You review a sample early, so the schema and correction policy match your needs
before the full run.

## 4. A working demo

We have already built this end to end for the **U.S. Military Academy Association
of Graduates necrology, 1870–1941** — every obituary and death notice across 72
annual reports, searchable and linked to the USMA Digital Library scans. It is
live at [demo URL] and the full pipeline is open for your technical team to review.

## 5. Scope for this engagement

| Item | Included |
|---|---|
| Source volumes covered | [n volumes / year range] |
| Estimated pages | [n] |
| Record types extracted | [obituaries, notices, roster entries, …] |
| Fields per record | [list] |
| Deliverable formats | Search site + SQLite + CSV + JSON |
| Export formats on site | CSV, JSON, Markdown, print/PDF |
| Hosting | [Cloudflare Pages / client domain] |
| Review cycles | [n] |

**Out of scope (available separately):** new scanning of physical originals,
handwritten-manuscript transcription, ongoing editorial curation, and integration
with a third-party catalog or CMS.

## 6. Timeline

| Phase | Duration |
|---|---|
| Kickoff, sample review, schema sign-off | [x] |
| Full extraction & dataset build | [x] |
| Site build & deployment | [x] |
| Review & handoff | [x] |

## 7. Why us

- **You own everything** — the data, the exports, and the code. No lock-in, no
  per-seat fees, no dependence on a hosted platform to keep the archive alive.
- **Source-faithful** — original text is transcribed, not paraphrased; every
  record links to the scan so anything can be verified.
- **Low-maintenance** — the published site is static: it costs almost nothing to
  host and cannot "go down" the way a database-backed app can.
- **Extensible** — the same pipeline ingests future volumes on demand.

## 8. Next step

If this looks right, we'll send a short service agreement and schedule a kickoff.
A [x]-page sample extraction can be turned around in [x] so you can see the
quality against your own material before committing to the full collection.

---

*Pricing provided under separate cover.*
