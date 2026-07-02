"use client";

import { useEffect, useMemo, useState } from "react";

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

type FullRecord = {
  name_raw: string;
  class_year: number | null;
  class_label: string | null;
  cullum_number: string | null;
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

const SHOW_CAP = 400;

function displayName(r: IndexRow) {
  const given = [r.fn, r.mn].filter(Boolean).join(" ");
  return given ? `${r.ln}, ${given}` : r.ln || r.raw;
}

function classOf(r: { cls?: number | null; clsl?: string | null }) {
  return r.clsl || (r.cls ? String(r.cls) : null);
}

export default function Register() {
  const [index, setIndex] = useState<IndexRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [entryType, setEntryType] = useState("all");
  const [reportYear, setReportYear] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [yearCache, setYearCache] = useState<Record<number, Record<string, FullRecord>>>({});

  useEffect(() => {
    fetch("data/index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setIndex)
      .catch(() => setLoadError(true));
  }, []);

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
    if (next && !yearCache[row.year]) {
      fetch(`data/years/${row.year}.json`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((recs) => setYearCache((c) => ({ ...c, [row.year]: recs })))
        .catch(() => {});
    }
  }

  if (loadError)
    return <p className="status">The register failed to load. Refresh the page to try again.</p>;
  if (!index) return <p className="status">Opening the register…</p>;

  return (
    <section aria-label="Register of the deceased">
      <div className="controls">
        <input
          className="searchbox"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, class, Cullum number, or place of death"
          aria-label="Search the register"
        />
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
          <span className="count" role="status">
            {matches.length.toLocaleString()} of {index.length.toLocaleString()} records
          </span>
        </div>
      </div>

      {matches.length === 0 && (
        <p className="status">
          No records match. Try a surname alone, or clear the filters.
        </p>
      )}

      {groups.map((g) => (
        <div key={g.year}>
          <h2 className="year-heading">Annual Report of {g.year}</h2>
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
                    <span className="notice-mark" title="Death notice (no memorial text)">
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
          Showing the first {SHOW_CAP} of {matches.length.toLocaleString()} matches — narrow the
          search to see the rest.
        </p>
      )}
    </section>
  );
}

function Detail({ row, record }: { row: IndexRow; record?: FullRecord }) {
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

      {paragraphs.length > 0 ? (
        <div className="obit">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {record.author && <p className="obit-author">— {record.author}</p>}
        </div>
      ) : (
        <p className="status">
          A death notice only — no memorial was printed for {displayName(row)} this year.
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
