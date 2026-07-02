import Register from "./register";

export default function Home() {
  return (
    <div className="shell">
      <header className="masthead">
        <p className="eyebrow">Association of Graduates · U.S. Military Academy</p>
        <h1>
          Necrology <span className="years">1870–1941</span>
        </h1>
        <p className="subtitle">
          Every obituary and death notice published in the annual reports of the
          Association of Graduates, searchable and linked to the scanned pages
          in the USMA Digital Library.
        </p>
        <hr className="double-rule" />
      </header>

      <Register />

      <footer className="colophon">
        <p>
          Source: annual reunion reports digitized by the{" "}
          <a
            href="https://usmalibrary.contentdm.oclc.org/digital/collection/aogreunion/search"
            target="_blank"
            rel="noopener noreferrer"
          >
            USMA Library
          </a>
          . Text lightly corrected from the original OCR; names and dates kept
          as printed.
        </p>
      </footer>
    </div>
  );
}
