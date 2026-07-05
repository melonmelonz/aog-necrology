"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  printMemorials,
  exportData,
  downloadMemorialDocx,
  type Memorial,
  type ResultRow,
} from "./exports";

type IndexRow = {
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

const SHOW_CAP = 400;

function displayName(r: IndexRow) {
  const given = [r.fn, r.mn].filter(Boolean).join(" ");
  return given ? `${r.ln}, ${given}` : r.ln || r.raw;
}

function classOf(r: { cls?: number | null; clsl?: string | null }) {
  return r.clsl || (r.cls ? String(r.cls) : null);
}

function byPage(a: Memorial, b: Memorial) {
  return (a.page_number ?? 0) - (b.page_number ?? 0);
}

export default function Register() {
  const [index, setIndex] = useState<IndexRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [entryType, setEntryType] = useState("all");
  const [reportYear, setReportYear] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [yearCache, setYearCache] = useState<Record<number, Record<string, Memorial>>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("data/index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setIndex)
      .catch(() => setLoadError(true));
  }, []);

  const loadYear = useCallback(
    async (year: number): Promise<Record<string, Memorial>> => {
      if (yearCache[year]) return yearCache[year];
      const recs = await fetch(`data/years/${year}.json`).then((r) =>
        r.ok ? r.json() : Promise.reject(r.status),
      );
      setYearCache((c) => ({ ...c, [year]: recs }));
      return recs;
    },
    [yearCache],
  );

  const reportYears = useMemo(
    () => (index ? [...new Set(index.map((r) => r.year))].sort() : []),
    [index],
  );

  const matches = useMemo(() => {
    if (!index) return [];
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return index.filter((r) => {
      if (entryType !== "all" && r.type !== entryType) return false;
      if (reportYear !== "all" && r.year !== Number(reportYear)) return false;
      if (!terms.length) return true;
      const hay = [r.ln, r.fn, r.mn, r.raw, r.cul, classOf(r), r.dod, r.dodr, r.loc, r.year]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [index, query, entryType, reportYear]);

  const label = [
    "aog-necrology",
    reportYear !== "all" ? reportYear : null,
    entryType !== "all" ? entryType : null,
    query.trim() ? query.trim().slice(0, 24) : null,
  ]
    .filter(Boolean)
    .join("-");

  const shown = matches.slice(0, SHOW_CAP);

  const groups = useMemo(() => {
    const g: { year: number; rows: IndexRow[] }[] = [];
    for (const r of shown) {
      const last = g[g.length - 1];
      if (last && last.year === r.year) last.rows.push(r);
      else g.push({ year: r.year, rows: [r] });
    }
    return g;
  }, [shown]);

  function toggle(row: IndexRow) {
    const next = openId === row.id ? null : row.id;
    setOpenId(next);
    if (next) loadYear(row.year).catch(() => {});
  }

  async function printMatches() {
    if (!matches.length || busy) return;
    setBusy(true);
    try {
      const years = [...new Set(matches.map((r) => r.year))];
      const maps = Object.fromEntries(
        await Promise.all(years.map(async (y) => [y, await loadYear(y)] as const)),
      );
      const full = matches
        .map((r) => maps[r.year]?.[r.id])
        .filter((m): m is Memorial => Boolean(m));
      const sub =
        reportYear !== "all"
          ? `Annual Report of ${reportYear}`
          : query.trim()
            ? `Search: “${query.trim()}” · ${full.length} memorials`
            : `${full.length} memorials`;
      printMemorials(full, "The Necrology", sub);
    } finally {
      setBusy(false);
    }
  }

  async function printYear(year: number) {
    if (busy) return;
    setBusy(true);
    try {
      const map = await loadYear(year);
      const full = Object.values(map).sort(byPage);
      printMemorials(full, "Necrology", `Annual Report of ${year}`);
    } finally {
      setBusy(false);
    }
  }

  async function printAll() {
    if (busy) return;
    setBusy(true);
    try {
      const all: Memorial[] = await fetch("download/necrology.json").then((r) => r.json());
      all.sort((a, b) => a.source_report_year - b.source_report_year || byPage(a, b));
      printMemorials(all, "The Necrology of the Association of Graduates", "1870 – 1941");
    } finally {
      setBusy(false);
    }
  }

  if (loadError)
    return (
      <section className="register" id="register">
        <p className="status">The register could not be opened. Refresh the page to try again.</p>
      </section>
    );
  if (!index)
    return (
      <section className="register" id="register">
        <p className="status">Opening the register…</p>
      </section>
    );

  const resultRows: ResultRow[] = matches;

  return (
    <section className="register" id="register" aria-label="Register of the deceased">
      <div className="reg-intro">
        <h2>The Necrology · 1870–1941</h2>
        <p>
          Every graduate whose death was reported to the Association of Graduates —
          transcribed from the printed reports, kept as written, and linked to the
          original scanned page. Search a name below, or read the roll year by year.
        </p>
      </div>

      <div className="searchbar">
        <input
          className="searchbox"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a name, class, Cullum number, or place of death"
          aria-label="Search the register"
        />
        <span className="count" role="status">
          {matches.length.toLocaleString()} of {index.length.toLocaleString()}
        </span>
      </div>

      <div className="subcontrols">
        <div className="filters">
          <label>
            Entries
            <select value={entryType} onChange={(e) => setEntryType(e.target.value)}>
              <option value="all">All</option>
              <option value="obituary">Obituaries</option>
              <option value="death_notice">Death notices</option>
            </select>
          </label>
          <label>
            Report year
            <select value={reportYear} onChange={(e) => setReportYear(e.target.value)}>
              <option value="all">All</option>
              {reportYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="actions" role="group" aria-label="Print or export these results">
          <span className="actions-label">These {matches.length.toLocaleString()} —</span>
          <button
            type="button"
            className="chip chip-gold"
            disabled={!matches.length || busy}
            onClick={printMatches}
            title="Open a printable / PDF memorial document of these results"
          >
            {busy ? "Preparing…" : "Print as memorials"}
          </button>
          <button
            type="button"
            className="chip"
            disabled={!matches.length}
            onClick={() => exportData(resultRows, "csv", label)}
            title="Spreadsheet (Excel, Sheets)"
          >
            CSV
          </button>
          <button
            type="button"
            className="chip"
            disabled={!matches.length}
            onClick={() => exportData(resultRows, "json", label)}
            title="Structured data"
          >
            JSON
          </button>
        </div>
      </div>

      {matches.length === 0 && (
        <p className="status">No records match. Try a surname alone, or clear the filters.</p>
      )}

      {groups.map((g) => (
        <div key={g.year} className="year-block">
          <div className="year-heading">
            <h3>Annual Report of {g.year}</h3>
            <button
              type="button"
              className="year-print"
              disabled={busy}
              onClick={() => printYear(g.year)}
              title={`Print every memorial in the ${g.year} report`}
            >
              Print this report →
            </button>
          </div>
          {g.rows.map((r) => (
            <div key={r.id}>
              <button
                type="button"
                className="row"
                aria-expanded={openId === r.id}
                onClick={() => toggle(r)}
              >
                <span className="cullum">{r.cul ?? "—"}</span>
                <span className="name">{displayName(r)}</span>
                <span className="leader" aria-hidden="true" />
                <span className="row-meta">
                  {classOf(r) ? `Class of ${classOf(r)}` : "class unknown"}
                  {" · "}
                  {r.dod ?? r.dodr ?? "date unknown"}
                  {r.type === "death_notice" && (
                    <span className="notice-mark" title="Death notice — no memorial text">
                      {" "}
                      †
                    </span>
                  )}
                </span>
              </button>
              {openId === r.id && <Detail row={r} record={yearCache[r.year]?.[r.id]} />}
            </div>
          ))}
        </div>
      ))}

      {matches.length > SHOW_CAP && (
        <p className="truncated">
          Showing the first {SHOW_CAP} of {matches.length.toLocaleString()} — narrow the search to
          see the rest, or print / export the full set above.
        </p>
      )}

      <Deposit onPrintAll={printAll} busy={busy} total={index.length} />
    </section>
  );
}

function Detail({ row, record }: { row: IndexRow; record?: Memorial }) {
  if (!record) return <div className="detail status">Fetching the record…</div>;

  const meta: [string, string | null][] = [
    ["As printed", record.name_raw],
    ["Class", classOf({ cls: record.class_year, clsl: record.class_label })],
    ["Cullum no.", record.cullum_number],
    ["Died", record.date_of_death_raw],
    ["Place", record.location_of_death],
    ["Age", record.age_at_death != null ? String(record.age_at_death) : null],
    ["Born", record.date_of_birth_raw],
    ["Interred", record.interment_location],
  ];

  const paragraphs = record.obit_text
    ? record.obit_text.split(/\n\s*\n/).filter((p) => p.trim())
    : [];

  return (
    <div className="detail">
      <div className="detail-head">
        <dl className="detail-meta">
          {meta
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <span key={k} style={{ display: "contents" }}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </span>
            ))}
        </dl>
        <div className="detail-actions">
          <button
            type="button"
            className="print-memorial"
            onClick={() => printMemorials([record], "In Memoriam")}
            title="Open a printable / PDF memorial for this graduate"
          >
            Print this memorial
          </button>
          <button
            type="button"
            className="print-memorial"
            onClick={() => void downloadMemorialDocx(record)}
            title="Download this memorial as a Word (.docx) document"
          >
            Download Word document
          </button>
        </div>
      </div>

      {paragraphs.length > 0 ? (
        <div className="obit">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {record.author && <p className="obit-author">— {record.author}</p>}
        </div>
      ) : (
        <p className="status">
          A death notice recorded this year — no memorial was printed for {displayName(row)}.
        </p>
      )}

      <div className="source-line">
        <span>
          Annual Report of {record.source_report_year}
          {record.page_number != null &&
            `, p. ${record.page_number}${
              record.page_end && record.page_end !== record.page_number
                ? `–${record.page_end}`
                : ""
            }`}
        </span>
        {record.obit_link && (
          <a href={record.obit_link} target="_blank" rel="noopener noreferrer">
            View the scanned page
          </a>
        )}
        {(record.confidence === "low" || record.needs_vision) && (
          <span className="flag" title="The OCR for this entry was poor; the text may contain errors.">
            transcription flagged for review
          </span>
        )}
      </div>
    </div>
  );
}

function Deposit({
  onPrintAll,
  busy,
  total,
}: {
  onPrintAll: () => void;
  busy: boolean;
  total: number;
}) {
  return (
    <section className="deposit" id="deposit" aria-label="Download the complete record">
      <h2>Download the complete record</h2>
      <p className="lede">
        The entire register — {total.toLocaleString()} records — as a database, a spreadsheet, or
        structured data. Yours to keep, search, and republish.
      </p>
      <div className="deposit-grid">
        <a className="deposit-card" href="download/necrology.sqlite" download>
          <span className="fmt">SQLite</span>
          <span className="desc">Full database, full-text searchable</span>
        </a>
        <a className="deposit-card" href="download/necrology.csv" download>
          <span className="fmt">CSV</span>
          <span className="desc">Spreadsheet — Excel, Numbers, Sheets</span>
        </a>
        <a className="deposit-card" href="download/necrology.json" download>
          <span className="fmt">JSON</span>
          <span className="desc">Structured data for developers</span>
        </a>
      </div>

      <button
        type="button"
        className="chip chip-gold deposit-print"
        disabled={busy}
        onClick={onPrintAll}
        title="Open every memorial as one printable / PDF document"
      >
        {busy ? "Preparing…" : "Print the entire necrology →"}
      </button>

      <p className="deposit-tool">
        This record was built by an open pipeline that harvests the scans, transcribes each page,
        and compiles the database.{" "}
        <a
          href="https://github.com/melonmelonz/aog-necrology"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download the tool and read how it works →
        </a>
      </p>
    </section>
  );
}
