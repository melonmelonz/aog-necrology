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

      <Register />
    </main>
  );
}
