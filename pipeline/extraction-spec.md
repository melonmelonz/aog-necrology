# AOG Obituary Extraction Spec

Governs the LLM structuring pass that turns per-page OCR text
(`data/pages/{year}.jsonl`) into person records (`data/extracted/{year}.json`).

## What to extract

Each record is **one deceased person** reported in that year's annual report.
Two entry types:

- `obituary` — a memorial with prose (a paragraph to many pages), often signed.
- `death_notice` — a brief entry in the year's necrology ("deaths since last
  annual reunion") with no memorial prose: name, class, date/place of death.

**Where they appear varies by era.** In early reports (1870s) the death
notices and eulogies are embedded inside the "Minutes of the Business
Meeting" as a numbered list — extract them from there. Later reports have a
dedicated obituary/memorial section. Follow the content, not the section
headings.

## What to SKIP

- The cumulative **Register of Graduates** (every graduate ever, living and
  dead, e.g. "762 13 JOHN E. HENDERSON. Died, July 4, 1836..."). It repeats
  every year and would create mass duplicates. Recognizable: long numbered
  roster ordered by Cullum number covering all classes, including living
  members. A death record in scope is one *reported for that report year's
  necrology*, not a roster line.
- Business proceedings, constitution/by-laws, member lists, treasurer
  reports, advertisements.

## Record schema (JSON)

```json
{
  "last_name": "",            // required
  "first_name": "",
  "middle_name": "",          // middle names/initials; null if none
  "name_raw": "",             // name exactly as printed (before corrections)
  "class_year": 1861,         // int graduation year; null if unknown
  "class_label": "May 1861",  // only when the printed class isn't a plain year
  "cullum_number": "1234",    // register number as text; null if not stated
  "date_of_death": "1869-09-01",  // ISO; partial allowed: "1869-09" / "1869"
  "date_of_death_raw": "Sept. 1, 1869",  // as printed
  "location_of_death": "Forest Home, Miss.",
  "age_at_death": 23,         // int or null
  "date_of_birth": "1846-05-12",  // ISO if stated in the obit, else null
  "date_of_birth_raw": null,
  "obit_text": "",            // full memorial prose, lightly corrected; "" for death_notice
  "author": null,             // signatory/author of the memorial if present
  "interment_location": null, // burial location if stated
  "entry_type": "obituary",   // or "death_notice"
  "source_report_year": 1870,
  "page_number": 8,           // page where the entry begins (PDF page_num)
  "page_end": 10,             // last page of the entry
  "obit_link": "https://usmalibrary.contentdm.oclc.org/digital/collection/aogreunion/id/{page_pointer}",
  "confidence": "high",       // high | medium | low — your own judgment
  "confidence_notes": null,   // why, if medium/low
  "needs_vision": false       // true if OCR too garbled to trust; page image should be re-read
}
```

`obit_link` and `page_number` come from the page record where the entry
starts. Multi-page obituaries: concatenate text across pages, dropping
running headers/footers and page numbers.

## Light corrections (obit_text and fields)

- Fix obvious OCR errors: `Jew York` → `New York`, `MORRIs` → `Morris`,
  `inbattle` → `in battle`, `IIl.` → `Ill.`, stray `�`/`\l`/`1'72`-style
  digit noise when the intended reading is unambiguous.
- Rejoin words hyphenated across line breaks (`ac-complished` → `accomplished`).
- Replace stray `�` with the evident intended character — usually an em dash
  (`Church�the` → `Church—the`) or an apostrophe; if unclear, use `—`.
- Normalize whitespace; keep paragraph breaks (blank line between paragraphs).
- Convert ALL-CAPS printed names to normal capitalization in the name fields
  (keep `name_raw` as printed).
- Do NOT modernize spelling, grammar, or word choice. Do NOT paraphrase,
  summarize, or omit text. When the intended reading is not obvious, keep
  the OCR as-is and lower `confidence`.

## Confidence guide

- `high` — clean text, all key fields unambiguous.
- `medium` — minor OCR noise or one uncertain field (e.g. partial date).
- `low` — garbled passages, guessed fields, or possible mis-segmentation.
  Set `needs_vision: true` when re-reading the page image would resolve it.

## Output

One JSON array per report year at `data/extracted/{year}.json`, ordered as
the entries appear in the report. No dedup across years at this stage —
if a person got a death_notice one year and a full obituary the next, both
records exist; merging happens later keyed on cullum_number.
