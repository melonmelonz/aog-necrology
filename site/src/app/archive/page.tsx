import Link from "next/link";
import Register from "../register";

export const metadata = {
  title: "The Register · Necrology of the A.O.G., U.S.M.A. · 1870–1941",
  description:
    "Search every obituary and death notice reported to the Association of Graduates of the United States Military Academy, 1870–1941, and print or download the record.",
};

export default function Archive() {
  return (
    <div className="shell">
      <header className="masthead">
        <Link href="/" className="back-link">
          ← Frontispiece
        </Link>
        <h1>Necrology</h1>
        <div className="years">1870 — 1941</div>
        <p className="subtitle">
          Every obituary and death notice reported to the Association of Graduates
          of the United States Military Academy — searchable, linked to the
          original scanned pages, and free to print or download.
        </p>
      </header>

      <Register />

      <footer className="colophon">
        <p>
          Drawn from the annual reunion reports of the Association of Graduates,
          digitized by the{" "}
          <a
            href="https://usmalibrary.contentdm.oclc.org/digital/collection/aogreunion/search"
            target="_blank"
            rel="noopener noreferrer"
          >
            U.S. Military Academy Library
          </a>
          . Text lightly corrected from the original transcription; names and
          dates kept as printed.
        </p>
      </footer>
    </div>
  );
}
