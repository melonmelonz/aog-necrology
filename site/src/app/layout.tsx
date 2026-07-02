import type { Metadata } from "next";
import { Old_Standard_TT, Source_Serif_4, Courier_Prime } from "next/font/google";
import "./globals.css";

const display = Old_Standard_TT({
  variable: "--font-display",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
});

const data = Courier_Prime({
  variable: "--font-data",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Necrology · Association of Graduates, U.S.M.A. 1870–1941",
  description:
    "Every obituary and death notice published in the West Point Association of Graduates annual reports, 1870–1941, searchable and linked to the scanned source pages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${data.variable}`}>
      <body>{children}</body>
    </html>
  );
}
