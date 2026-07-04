import type { Metadata } from "next";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import "./globals.css";

// Cormorant Garamond — high-contrast, engraved display for the masthead and
// the names in the roll; set large and letter-spaced it reads like inscription.
const display = Cormorant_Garamond({
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// EB Garamond — the book-type lineage of 1870–1941 letterpress; the obituary prose.
const body = EB_Garamond({
  variable: "--font-body",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Necrology · Association of Graduates, U.S.M.A. · 1870–1941",
  description:
    "A memorial record of graduates of the United States Military Academy whose deaths were reported to the Association of Graduates at its annual reunions, 1870–1941 — searchable and linked to the original scanned pages.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
