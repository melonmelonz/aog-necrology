// Export of the register in two registers:
//
//   1. Memorial documents (print / PDF) — a single graduate, a whole year's
//      necrology, or the entire record, typeset as dignified memorial pages.
//   2. Data (CSV / JSON) of the current search results, for archival/data use.
//
// Everything is generated in the browser from records already loaded — no
// dependencies, so it works on the fully static site.

/** A full record as stored in data/years/{year}.json (the complete schema). */
export type Memorial = {
  id: string;
  last_name: string;
  first_name: string | null;
  middle_name: string | null;
  name_raw: string | null;
  class_year: number | null;
  class_label: string | null;
  cullum_number: string | null;
  date_of_death: string | null;
  date_of_death_raw: string | null;
  location_of_death: string | null;
  age_at_death: number | null;
  date_of_birth_raw: string | null;
  interment_location: string | null;
  obit_text: string;
  author: string | null;
  entry_type: string;
  source_report_year: number;
  page_number: number | null;
  page_end: number | null;
  obit_link: string | null;
  confidence: string;
  needs_vision: boolean;
};

/* ---------- shared helpers ---------- */

function naturalName(m: {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string;
  name_raw?: string | null;
}): string {
  const given = [m.first_name, m.middle_name].filter(Boolean).join(" ");
  if (m.last_name && given) return `${given} ${m.last_name}`;
  if (m.last_name) return m.last_name;
  return m.name_raw || "";
}

function classText(m: { class_year: number | null; class_label: string | null }): string {
  if (m.class_label) return m.class_label;
  if (m.class_year != null) return `Class of ${m.class_year}`;
  return "";
}

function esc(v: string | number | null | undefined): string {
  return (v == null ? "" : String(v))
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ---------- memorial documents (print / PDF) ---------- */

function factsLine(m: Memorial): string {
  const parts: string[] = [];
  const cls = classText(m);
  if (cls) parts.push(cls);
  if (m.cullum_number) parts.push(`Cullum No.&nbsp;${esc(m.cullum_number)}`);
  return parts.join("&nbsp;&nbsp;·&nbsp;&nbsp;");
}

function deathLine(m: Memorial): string {
  const bits: string[] = [];
  if (m.date_of_death_raw) bits.push(`Died ${esc(m.date_of_death_raw)}`);
  if (m.location_of_death) bits.push(`at ${esc(m.location_of_death)}`);
  let line = bits.join(", ");
  if (m.age_at_death != null) line += `${line ? "" : "Died"}, aged ${m.age_at_death} years`;
  return line ? line + "." : "";
}

function memorialHTML(m: Memorial): string {
  const paras = (m.obit_text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const body = paras.length
    ? `<div class="mem-body">${paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`
    : `<p class="mem-none">A death notice recorded in the annual report; no memorial was printed.</p>`;

  const source: string[] = [
    `Annual Report of the Association of Graduates, ${m.source_report_year}`,
  ];
  if (m.page_number != null) {
    source[0] +=
      m.page_end && m.page_end !== m.page_number
        ? `, pp.&nbsp;${m.page_number}–${m.page_end}`
        : `, p.&nbsp;${m.page_number}`;
  }
  source.push("U.S. Military Academy Library, Digital Collections.");

  return `
  <article class="mem">
    <h2 class="mem-name">${esc(naturalName(m))}</h2>
    ${factsLine(m) ? `<p class="mem-facts">${factsLine(m)}</p>` : ""}
    ${deathLine(m) ? `<p class="mem-death">${deathLine(m)}</p>` : ""}
    <div class="mem-rule"></div>
    ${body}
    ${m.author ? `<p class="mem-author">— ${esc(m.author)}</p>` : ""}
    <p class="mem-source">${source.join(" ")}</p>
  </article>`;
}

function printDocument(memorials: Memorial[], heading: string, sub: string): string {
  const dated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(heading)}${sub ? " — " + esc(sub) : ""}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  @page { margin: 1in 1in 0.9in; }
  * { box-sizing: border-box; }
  body {
    font-family: 'EB Garamond', Garamond, 'Times New Roman', serif;
    color: #20242a; line-height: 1.7; margin: 0;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .doc-head { text-align: center; margin: 0 0 2.4rem; }
  .doc-eyebrow {
    font-variant: small-caps; letter-spacing: 0.24em; font-size: 0.8rem;
    color: #697079; margin: 0;
  }
  .doc-title {
    font-family: 'Cormorant Garamond', Garamond, serif; font-weight: 500;
    font-size: 2.1rem; letter-spacing: 0.16em; text-transform: uppercase;
    margin: 0.5rem 0 0.2rem; color: #20242a;
  }
  .doc-sub { font-style: italic; color: #4a5058; margin: 0; }
  .doc-headrule { width: 3rem; height: 0; border-top: 1.5px solid #8a6f2e; margin: 1rem auto 0; }

  .mem { max-width: 34rem; margin: 0 auto; padding: 0.2in 0 0.4in; page-break-inside: avoid; }
  .mem + .mem { border-top: 1px solid #cbccc6; padding-top: 0.55in; }
  .mem-name {
    font-family: 'Cormorant Garamond', Garamond, serif; font-weight: 500;
    text-align: center; text-transform: uppercase; letter-spacing: 0.14em;
    font-size: 1.7rem; margin: 0 0 0.35rem; color: #20242a;
  }
  .mem-facts { text-align: center; font-variant: small-caps; letter-spacing: 0.08em; color: #697079; margin: 0 0 0.15rem; font-size: 0.95rem; }
  .mem-death { text-align: center; font-style: italic; color: #4a5058; margin: 0.1rem 0 0; }
  .mem-rule { width: 2.2rem; border-top: 1px solid #b4b5ae; margin: 1rem auto 1.3rem; }
  .mem-body p { text-indent: 1.5em; margin: 0 0 0.35rem; text-align: justify; }
  .mem-body p:first-child { text-indent: 0; }
  .mem-none { text-align: center; font-style: italic; color: #697079; }
  .mem-author { text-align: right; font-variant: small-caps; letter-spacing: 0.1em; margin: 1.1rem 0 0; color: #20242a; }
  .mem-source { margin: 1.4rem 0 0; padding-top: 0.6rem; border-top: 1px solid #cbccc6; font-size: 0.8rem; color: #697079; text-align: center; }

  .doc-foot { text-align: center; color: #8b9099; font-size: 0.72rem; letter-spacing: 0.04em; margin: 2.4rem 0 0; }
  @media screen { body { background: #f1f1ec; padding: 2rem 1rem; } .sheet { background: #fff; max-width: 46rem; margin: 0 auto; padding: 3rem 2.5rem; box-shadow: 0 24px 60px -40px rgba(20,23,26,.5); } }
  @media print { .sheet { padding: 0; } }
</style></head><body>
<div class="sheet">
  <header class="doc-head">
    <p class="doc-eyebrow">Association of Graduates · United States Military Academy</p>
    <h1 class="doc-title">${esc(heading)}</h1>
    ${sub ? `<p class="doc-sub">${esc(sub)}</p>` : ""}
    <div class="doc-headrule"></div>
  </header>
  ${memorials.map(memorialHTML).join("\n")}
  <p class="doc-foot">${memorials.length.toLocaleString()} memorial${memorials.length === 1 ? "" : "s"} · prepared ${dated} · text transcribed from the original reports, lightly corrected.</p>
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},400)}</script>
</body></html>`;
}

/** Open a print/PDF window of one or more memorials, typeset as documents. */
export function printMemorials(memorials: Memorial[], heading: string, sub = "") {
  if (!memorials.length) return;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(printDocument(memorials, heading, sub));
  w.document.close();
}

/* ---------- data export of search results (CSV / JSON) ---------- */

export type ResultRow = {
  ln: string;
  fn: string;
  mn: string;
  raw: string;
  cls: number | null;
  clsl: string | null;
  cul: string | null;
  dod: string | null;
  dodr: string | null;
  loc: string | null;
  type: string;
  year: number;
  page: number | null;
};

const HEADERS = [
  "last_name",
  "first_name",
  "middle_name",
  "name_as_printed",
  "class",
  "cullum_number",
  "date_of_death",
  "date_of_death_printed",
  "place_of_death",
  "entry_type",
  "report_year",
  "page",
];

function classOf(r: ResultRow): string {
  return r.clsl || (r.cls != null ? String(r.cls) : "");
}

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toCSV(rows: ResultRow[]): string {
  const lines = [HEADERS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.ln,
        r.fn,
        r.mn,
        r.raw,
        classOf(r),
        r.cul ?? "",
        r.dod ?? "",
        r.dodr ?? "",
        r.loc ?? "",
        r.type,
        String(r.year),
        r.page != null ? String(r.page) : "",
      ]
        .map((v) => csvCell(v == null ? "" : String(v)))
        .join(","),
    );
  }
  return "﻿" + lines.join("\r\n"); // BOM so Excel reads UTF-8
}

export function toJSON(rows: ResultRow[]): string {
  return JSON.stringify(
    rows.map((r) => ({
      last_name: r.ln,
      first_name: r.fn || null,
      middle_name: r.mn || null,
      name_as_printed: r.raw || null,
      class: classOf(r) || null,
      cullum_number: r.cul,
      date_of_death: r.dod,
      date_of_death_printed: r.dodr,
      place_of_death: r.loc,
      entry_type: r.type,
      report_year: r.year,
      page: r.page,
    })),
    null,
    2,
  );
}

export function downloadText(filename: string, mime: string, text: string) {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportData(rows: ResultRow[], format: "csv" | "json", label: string) {
  const base = label.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "aog-necrology";
  if (format === "csv") downloadText(`${base}.csv`, "text/csv", toCSV(rows));
  else downloadText(`${base}.json`, "application/json", toJSON(rows));
}
