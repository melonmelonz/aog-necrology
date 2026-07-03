// AOG extraction workflow — one Claude subagent per ~60-page chunk.
//
// This is a Claude Code *workflow* script (see the Workflow tool). It is NOT
// run with node. Launch it from a Claude Code session like:
//
//   Workflow({ scriptPath: "<abs path to this file>",
//              args: <JSON array from `python pipeline/todo.py`> })
//
// Then re-run merge -> build_db -> site_data to fold the new parts in.
//
// === SET THIS to your checkout's absolute path before running ===
const ROOT = 'C:\\Users\\Calvin\\aog-necrology'
// Windows: double-backslashes.  macOS/Linux: e.g. '/home/kit/aog-necrology'.
//
// Hard lessons baked in (do not "simplify" these away):
//  - `args` can arrive as a JSON *string*; parse it (line below).
//  - Run on 'sonnet', not opus/fable — this is mechanical spec-following work;
//    opus drains fast and fable has a low cap. Sonnet is cheap and accurate here.
//  - Feed it in WAVES (~20-40 chunks), not all ~250 at once. When a usage/session
//    limit trips, every in-flight and queued agent fails at once and you lose the
//    whole batch for nothing. Small waves bound the blast radius; completed parts
//    are already on disk, so `python pipeline/todo.py` always resumes cleanly.

export const meta = {
  name: 'aog-extract',
  description: 'Extract obituaries/death notices from AOG annual reports (one agent per chunk)',
  phases: [{ title: 'Extract', detail: 'one agent per ~60-page chunk' }],
}

const sep = ROOT.includes('\\') ? '\\' : '/'
const p = (...parts) => [ROOT, ...parts].join(sep)
const pad = n => String(n).padStart(3, '0')
const SPEC = p('pipeline', 'extraction-spec.md')
const chunks = typeof args === 'string' ? JSON.parse(args) : args

phase('Extract')
const results = await pipeline(
  chunks,
  ([year, start, end]) => {
    const name = `${year}_p${pad(start)}-${pad(end)}`
    const chunkFile = p('data', 'chunks', `${name}.txt`)
    const partFile = p('data', 'extracted', 'parts', `${name}.json`)
    return agent(
      `You are extracting deceased-person records from the ${year} USMA Association of Graduates annual report.

1. Read the spec: ${SPEC} - follow it exactly (record schema, light-corrections policy, skip rules, confidence guide).
2. Read the chunk file: ${chunkFile}
   It contains pages ${start}-${end} of the ${year} report, plus a few continuation pages marked "[CONTINUATION ONLY - do not start new entries here]". Each page begins with a "===== PAGE N (pointer P, link L) =====" header; use that page's N for page_number and L for obit_link of entries that begin there.
3. Extract EVERY in-scope death record (obituary or death_notice per the spec) that BEGINS on pages ${start}-${end}. Use continuation pages only to complete an entry that started in your range. If an entry begins in your range but its text is cut off at the end of the file, extract what is present, set page_end to the last available page, confidence "low", and note the truncation in confidence_notes.
4. REMEMBER the spec's skip rules: the cumulative Register of Graduates (long roster of ALL graduates including living members, ordered by Cullum number) is OUT of scope - if your pages are register/roster, minutes without death content, constitution, member lists, or treasurer tables, there may be zero records; that is a correct result.
5. Set source_report_year to ${year}. Transcribe obit_text FULLY - never summarize or truncate.
6. Write the records as a JSON array (empty array [] if none) to: ${partFile}
   UTF-8, 2-space indent. Then verify it parses: python -c "import json;json.load(open(r'${partFile}', encoding='utf-8'))" - fix and re-verify if it fails.

Work through the pages in order and be meticulous: every death record, full text, honest confidence.`,
      {
        label: `extract:${name}`,
        phase: 'Extract',
        model: 'sonnet',
        schema: {
          type: 'object',
          properties: {
            records: { type: 'number' },
            obituaries: { type: 'number' },
            death_notices: { type: 'number' },
            needs_vision: { type: 'number' },
            notes: { type: 'string' },
          },
          required: ['records', 'obituaries', 'death_notices', 'needs_vision', 'notes'],
        },
      }
    ).then(r => ({ year, start, end, ...r }))
  }
)

const ok = results.filter(Boolean)
const failed = chunks.filter((c, i) => !results[i]).map(([y, s, e]) => `${y}_p${pad(s)}-${pad(e)}`)
const totals = ok.reduce(
  (t, r) => ({
    records: t.records + (r.records || 0),
    obituaries: t.obituaries + (r.obituaries || 0),
    death_notices: t.death_notices + (r.death_notices || 0),
    needs_vision: t.needs_vision + (r.needs_vision || 0),
  }),
  { records: 0, obituaries: 0, death_notices: 0, needs_vision: 0 }
)
log(`extraction done: ${totals.records} records from ${ok.length}/${chunks.length} chunks`)
return { totals, chunksDone: ok.length, chunksTotal: chunks.length, failed }
