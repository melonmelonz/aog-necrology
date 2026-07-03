import Link from "next/link";
import Register from "../register";

export const metadata = {
  title: "Search the register · AOG Necrology 1870–1941",
  description:
    "Search every obituary and death notice in the USMA Association of Graduates annual reports, 1870–1941, and export the results.",
};

export default function Archive() {
  return (
    <div className="shell">
      <header className="masthead">
        <p className="eyebrow">
          <Link href="/" className="back-link">
            ← Digital Archive Services
          </Link>
        </p>
        <h1>
          Necrology <span className="years">1870–1941</span>
        </h1>
        <p className="subtitle">
          Every obituary and death notice published in the annual reports of the
          Association of Graduates, U.S. Military Academy — searchable, linked to
          the scanned pages, and exportable in the format you need.
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
          as printed. A working demonstration of the{" "}
          <Link href="/">Digital Archive Services</Link> pipeline.
        </p>
      </footer>
    </div>
  );
}
