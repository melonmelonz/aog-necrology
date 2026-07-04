import Link from "next/link";
import { readFileSync } from "fs";
import path from "path";

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

const REPO = "https://github.com/melonmelonz/aog-necrology";

export default function Frontispiece() {
  const s = readStats();
  const tally =
    s && s.year_min && s.year_max
      ? `${s.records.toLocaleString()} graduates recorded · reports of ${s.year_min}–${s.year_max}`
      : null;

  return (
    <main className="frontispiece">
      <div className="fp-plate">
        <span className="fp-eyebrow">
          Association of Graduates · United States Military Academy
        </span>

        <h1 className="fp-title">Necrology</h1>
        <div className="fp-years">1870 — 1941</div>

        <p className="fp-dedication">
          A memorial record of graduates of the Academy whose deaths were
          reported to the Association of Graduates at its annual reunions —
          each obituary transcribed from the printed report and linked to the
          original scanned page.
        </p>

        <p className="fp-benediction">
          “Well Done; Be Thou at Peace.”
          <span className="attribution">The traditional farewell to a departed graduate</span>
        </p>

        <Link href="/archive" className="fp-enter">
          Enter the register →
        </Link>

        {tally && <p className="fp-tally">{tally}</p>}

        <p className="fp-under">
          <Link href="/archive#deposit">Download the complete record</Link>
          {"   ·   "}
          <a href={REPO} target="_blank" rel="noopener noreferrer">
            How this record was made
          </a>
        </p>
      </div>
    </main>
  );
}
