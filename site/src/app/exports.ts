// Client-side export of the current (searched/filtered) register rows to
// several document formats. No dependencies — everything is generated in the
// browser and downloaded as a Blob, so it works on the static site.

export type ExportRow = {
  id: string;
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

export type ExportFormat = "csv" | "json" | "markdown" | "print";

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
  "source_link",
];

const SOURCE =
  "https://usmalibrary.contentdm.oclc.org/digital/collection/aogreunion";

function classOf(r: ExportRow): string {
  return r.clsl || (r.cls != null ? String(r.cls) : "");
}

function sourceLink(r: ExportRow): string {
  // The obit_link isn't in the index; reconstruct the collection deep link space.
  // Row-level links live in the full record; here we point at the report year.
  return `${SOURCE}/search/searchterm/${r.year}`;
}

function fields(r: ExportRow): string[] {
  return [
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
    sourceLink(r),
  ].map((v) => (v == null ? "" : String(v)));
}

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toCSV(rows: ExportRow[]): string {
  const lines = [HEADERS.join(",")];
  for (const r of rows) lines.push(fields(r).map(csvCell).join(","));
  return "﻿" + lines.join("\r\n"); // BOM so Excel reads UTF-8
}

export function toJSON(rows: ExportRow[]): string {
  const out = rows.map((r) => ({
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
    source_link: sourceLink(r),
  }));
  return JSON.stringify(out, null, 2);
}

export function toMarkdown(rows: ExportRow[], title: string): string {
  const lines = [
    `# ${title}`,
    "",
    `*${rows.length.toLocaleString()} record${rows.length === 1 ? "" : "s"} — exported from the AOG Necrology, 1870–1941.*`,
    "",
    "| Name | Class | Cullum | Died | Place | Report |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const r of rows) {
    const given = [r.fn, r.mn].filter(Boolean).join(" ");
    const name = given ? `${r.ln}, ${given}` : r.ln || r.raw;
    const cell = (v: string | number | null) =>
      (v == null ? "" : String(v)).replace(/\|/g, "\\|");
    lines.push(
      `| ${cell(name)} | ${cell(classOf(r))} | ${cell(r.cul)} | ${cell(r.dod ?? r.dodr)} | ${cell(r.loc)} | ${cell(r.year)} |`,
    );
  }
  return lines.join("\n") + "\n";
}

function printableHTML(rows: ExportRow[], title: string): string {
  const rowsHTML = rows
    .map((r) => {
      const given = [r.fn, r.mn].filter(Boolean).join(" ");
      const name = given ? `${r.ln}, ${given}` : r.ln || r.raw;
      const esc = (v: string | number | null) =>
        (v == null ? "" : String(v))
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      return `<tr><td>${esc(name)}</td><td>${esc(classOf(r))}</td><td>${esc(r.cul)}</td><td>${esc(r.dod ?? r.dodr)}</td><td>${esc(r.loc)}</td><td>${esc(r.year)}</td></tr>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; color: #14171a; margin: 2.5rem; }
  h1 { font-size: 1.4rem; letter-spacing: 0.04em; }
  .meta { color: #5a6472; font-size: 0.85rem; margin-bottom: 1.5rem; }
  table { border-collapse: collapse; width: 100%; font-size: 0.85rem; }
  th, td { text-align: left; padding: 0.35rem 0.6rem; border-bottom: 1px solid #d9d9d3; vertical-align: top; }
  th { border-bottom: 2px solid #14171a; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.72rem; }
  @media print { body { margin: 0.75in; } }
</style></head><body>
<h1>${title}</h1>
<p class="meta">${rows.length.toLocaleString()} record${rows.length === 1 ? "" : "s"} — AOG Necrology, 1870–1941. Source: USMA Digital Library.</p>
<table><thead><tr><th>Name</th><th>Class</th><th>Cullum</th><th>Died</th><th>Place</th><th>Report</th></tr></thead>
<tbody>${rowsHTML}</tbody></table>
<script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>
</body></html>`;
}

function download(filename: string, mime: string, text: string) {
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

/** Export the given rows in the chosen format. `label` seeds the filename/title. */
export function exportRows(
  rows: ExportRow[],
  format: ExportFormat,
  label = "aog-necrology",
) {
  const base = label.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "aog-necrology";
  const title = "AOG Necrology — selected records";
  switch (format) {
    case "csv":
      return download(`${base}.csv`, "text/csv", toCSV(rows));
    case "json":
      return download(`${base}.json`, "application/json", toJSON(rows));
    case "markdown":
      return download(`${base}.md`, "text/markdown", toMarkdown(rows, title));
    case "print": {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(printableHTML(rows, title));
        w.document.close();
      }
      return;
    }
  }
}
