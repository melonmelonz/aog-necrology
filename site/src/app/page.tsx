import { readFileSync } from "fs";
import path from "path";
import Register from "./register";

type Stats = {
  records: number;
  reports_transcribed: number;
  reports_total: number;
  year_min: number | null;
  year_max: number | null;
};

function readStats(): Stats | null {
  try {
    const p = path.join(process.cwd(), "public", "data", "stats.json");
    return JSON.parse(readFileSync(p, "utf-8")) as Stats;
  } catch {
    return null;
  }
}

export default function Page() {
  const s = readStats();
  const tally =
    s && s.year_min && s.year_max
      ? `${s.records.toLocaleString()} graduates recorded · reports of ${s.year_min}–${s.year_max}`
      : null;

  // Product-pitch copy — this archive is the live demonstration of the service.
  // Value props and stage descriptions mirror business/proposal-template.md so the
  // page, proposal, and verbal pitch tell one story. Edit copy here in one place.
  const values = [
    {
      t: "A structured dataset you own",
      d: "Every record in consistent fields — names, dates, places, full transcribed text — delivered as SQLite, CSV, and JSON, yours outright.",
    },
    {
      t: "A fast, archival search site",
      d: "Search by any field and open a full record. Mobile-friendly, and static, so it costs almost nothing to host and cannot go down.",
    },
    {
      t: "Linked to the source",
      d: "Every record links straight back to the scanned page it came from, so anything can be verified against the original.",
    },
    {
      t: "One-click exports",
      d: "Visitors and staff export search results as CSV, JSON, Markdown, or print / PDF for research and reuse.",
    },
    {
      t: "A reusable pipeline",
      d: "The same documented process ingests future volumes on demand, without starting the archive over.",
    },
  ];

  const stages = [
    {
      n: "1",
      name: "Harvest",
      d: "Retrieve the source scans and their OCR, and build a page-to-source map so every record can link back to its origin.",
    },
    {
      n: "2",
      name: "Structure",
      d: "AI extraction pulls records into a strict, reviewed schema — text kept verbatim, only obvious OCR errors fixed, every record confidence-flagged.",
    },
    {
      n: "3",
      name: "Compile",
      d: "Records are merged and de-duplicated into the dataset and its exports (SQLite with full-text search, CSV, JSON).",
    },
    {
      n: "4",
      name: "Publish",
      d: "A static, low-maintenance website is generated from the dataset and deployed to your domain.",
    },
  ];

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-eyebrow">
            Association of Graduates · United States Military Academy
          </span>

          <h1 className="hero-title">In Memoriam</h1>
          <div className="hero-years">1870 — 1941</div>

          <div className="ornament" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
            </svg>
          </div>

          <p className="hero-benediction">
            “Well Done; Be Thou at Peace.”
            <span className="hero-attr">The traditional farewell to a departed graduate</span>
          </p>

          <a className="hero-enter" href="#register">
            Enter the register <span className="arrow" aria-hidden="true">↓</span>
          </a>

          {tally && <p className="hero-tally">{tally}</p>}
        </div>
      </section>

      <section className="pitch" aria-labelledby="pitch-title">
        <div className="pitch-inner">
          <div className="pitch-ornament" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
            </svg>
          </div>

          <p className="pitch-eyebrow">
            A living demonstration · the digitization service behind this register
          </p>
          <h2 id="pitch-title" className="pitch-headline">
            Scanned collections, made searchable — and permanent.
          </h2>
          <p className="pitch-lede">
            We turn a scanned collection into a{" "}
            <strong>searchable, source-linked digital archive</strong> — a clean public website where
            anyone can search every name, date, and passage in seconds, and every result links straight
            back to the scanned original. Built for institutions, archives, and alumni associations
            sitting on historical collections no one can search.
          </p>

          <div className="pitch-feature">
            <p className="pitch-feature-eyebrow">Automation, shipped</p>
            <h3 className="pitch-feature-title">Official documents, generated on demand</h3>
            <p className="pitch-feature-desc">
              From any memorial in the register below, one click generates and downloads a Microsoft
              Word document in the Association of Graduates&rsquo; official memorial-article format —
              typeset entirely in your browser, with no manual retyping or reformatting. The archive
              does not just store records; it produces the documents the office needs.
            </p>
          </div>

          <ul className="pitch-values">
            {values.map((v) => (
              <li key={v.t} className="pitch-value">
                <span className="pitch-value-title">{v.t}</span>
                <span className="pitch-value-desc">{v.d}</span>
              </li>
            ))}
          </ul>

          <div className="pitch-flow-wrap">
            <p className="pitch-flow-label">A four-stage pipeline — proven on this very collection</p>
            <ol className="pitch-flow">
              {stages.map((st) => (
                <li key={st.name} className="pitch-stage">
                  <span className="pitch-stage-num" aria-hidden="true">
                    {st.n}
                  </span>
                  <span className="pitch-stage-name">{st.name}</span>
                  <span className="pitch-stage-desc">{st.d}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="pitch-cta">
            <a className="pitch-cta-btn" href="#register">
              Explore the live archive <span className="arrow" aria-hidden="true">↓</span>
            </a>
            <p className="pitch-cta-note">
              This page is the demo. Search below, open any memorial, and download its official Word
              document — generated entirely in your browser.
            </p>
          </div>
        </div>
      </section>

      <Register />
    </main>
  );
}
