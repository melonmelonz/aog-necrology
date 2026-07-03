import Link from "next/link";

const STEPS = [
  {
    n: "I",
    title: "Harvest",
    body: "We retrieve your scans and their existing OCR text, and map every page back to its source image.",
  },
  {
    n: "II",
    title: "Structure",
    body: "AI extraction reads each page into a strict, reviewed schema — original text kept verbatim, every record flagged for confidence.",
  },
  {
    n: "III",
    title: "Compile",
    body: "Records merge into one dataset with full-text search, delivered as SQLite, CSV, and JSON you own.",
  },
  {
    n: "IV",
    title: "Publish",
    body: "A fast, static search site is generated from the data and deployed to your domain — near-zero hosting, nothing to maintain.",
  },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="lp-hero">
        <p className="eyebrow">Digital Archive Services</p>
        <h1 className="lp-headline">
          Turn a shelf of scanned records into an archive anyone can search in
          seconds.
        </h1>
        <p className="lp-sub">
          We digitize historical document collections into a clean, searchable
          website where every name, date, and passage is findable — and every
          result links straight back to the original scan. You own the data, the
          exports, and the code.
        </p>
        <div className="lp-cta">
          <Link href="/archive" className="lp-btn-primary">
            Explore the live archive →
          </Link>
          <a href="#how" className="lp-btn-ghost">
            See how it works
          </a>
        </div>

        <div className="lp-specimen" aria-hidden="true">
          <div className="lp-specimen-rule" />
          <p className="lp-specimen-label">Register of the deceased · 1870</p>
          <ul className="lp-specimen-list">
            <li>
              <span className="lp-name">Park, Roswell</span>
              <span className="lp-leader" />
              <span className="lp-meta">Class of 1831 · d. 1869</span>
            </li>
            <li>
              <span className="lp-name">Bowman, Andrew W.</span>
              <span className="lp-leader" />
              <span className="lp-meta">Class of 1841 · d. 1869</span>
            </li>
            <li>
              <span className="lp-name">Chase, William H.</span>
              <span className="lp-leader" />
              <span className="lp-meta">Class of 1815 · d. 1870</span>
            </li>
          </ul>
          <div className="lp-specimen-rule" />
        </div>
      </header>

      <section className="lp-band">
        <p>
          A collection preserved as page images is safe but not{" "}
          <em>findable</em> — you can read one page at a time and nothing more.
          We make it searchable across every record without losing a word of the
          original.
        </p>
      </section>

      <section id="how" className="lp-how">
        <p className="eyebrow lp-center">The workflow</p>
        <h2 className="lp-h2">Four stages, one pipeline</h2>
        <ol className="lp-steps">
          {STEPS.map((s) => (
            <li key={s.n} className="lp-step">
              <span className="lp-step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="lp-demo">
        <div className="lp-demo-inner">
          <p className="eyebrow">Live demonstration</p>
          <h2 className="lp-h2">
            The West Point necrology, 1870–1941
          </h2>
          <p className="lp-demo-sub">
            Every obituary and death notice across 72 annual reports of the USMA
            Association of Graduates — extracted, searchable, and linked to the
            USMA Digital Library scans. Built end to end with the pipeline above.
          </p>
          <dl className="lp-stats">
            <div>
              <dt>Annual reports</dt>
              <dd>72</dd>
            </div>
            <div>
              <dt>Years covered</dt>
              <dd>1870–1941</dd>
            </div>
            <div>
              <dt>Export formats</dt>
              <dd>4</dd>
            </div>
            <div>
              <dt>You host it for</dt>
              <dd>≈ $0</dd>
            </div>
          </dl>
          <Link href="/archive" className="lp-btn-primary">
            Search the archive →
          </Link>
        </div>
      </section>

      <footer className="lp-footer">
        <p>
          Digital Archive Services — searchable, source-linked archives from your
          scanned collections. Get in touch at{" "}
          <a href="mailto:hello@example.com">hello@example.com</a>.
        </p>
      </footer>
    </div>
  );
}
