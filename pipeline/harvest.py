"""Harvest the USMA AOG Annual Reports collection (aogreunion) from CONTENTdm.

For each of the 72 annual reports (1870-1941):
  - fetch the compound-object page map (page number -> CONTENTdm page pointer)
  - download the full report PDF
  - extract per-page text from the embedded text layer
  - write data/pages/{year}.jsonl with one record per page

Page records carry the CONTENTdm pointer so every extracted person can deep-link
back to the exact page in the USMA Digital Library.
"""

import json
import sys
import time
import urllib.request
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    from PyPDF2 import PdfReader

BASE = "https://usmalibrary.contentdm.oclc.org"
ROOT = Path(__file__).resolve().parent.parent
PDFS = ROOT / "data" / "pdfs"
PAGES = ROOT / "data" / "pages"
COMPOUND = ROOT / "data" / "compound"

UA = {"User-Agent": "aog-necrology-research/1.0 (personal archival research)"}


def get(url, retries=4):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except Exception as e:
            if attempt == retries - 1:
                raise
            wait = 2 ** (attempt + 1)
            print(f"  retry {attempt+1} after error: {e} (waiting {wait}s)", flush=True)
            time.sleep(wait)


def get_json(url):
    return json.loads(get(url).decode("utf-8"))


def list_reports():
    d = get_json(f"{BASE}/digital/bl/dmwebservices/index.php"
                 f"?q=dmQuery/aogreunion/0/title!date/date/100/1/0/0/0/0/json")
    reports = []
    for r in d["records"]:
        if r["filetype"] == "cpd":
            reports.append({"year": int(r["date"]), "pointer": r["pointer"],
                            "title": r["title"]})
    reports.sort(key=lambda r: r["year"])
    return reports


def harvest_report(rep):
    year, ptr = rep["year"], rep["pointer"]
    out_jsonl = PAGES / f"{year}.jsonl"
    if out_jsonl.exists():
        print(f"{year}: already done, skipping", flush=True)
        return

    cpd_path = COMPOUND / f"{year}.json"
    if cpd_path.exists():
        cpd = json.loads(cpd_path.read_text(encoding="utf-8"))
    else:
        cpd = get_json(f"{BASE}/digital/bl/dmwebservices/index.php"
                       f"?q=dmGetCompoundObjectInfo/aogreunion/{ptr}/json")
        cpd_path.write_text(json.dumps(cpd), encoding="utf-8")

    pages = cpd["page"]
    if isinstance(pages, dict):  # single-page objects come back as a dict
        pages = [pages]

    pdf_path = PDFS / f"{year}.pdf"
    if not pdf_path.exists():
        data = get(f"{BASE}/digital/api/collection/aogreunion/id/{ptr}/download")
        pdf_path.write_bytes(data)

    reader = PdfReader(str(pdf_path))
    n_pdf, n_cpd = len(reader.pages), len(pages)
    if n_pdf != n_cpd:
        print(f"{year}: WARNING page count mismatch pdf={n_pdf} contentdm={n_cpd}",
              flush=True)

    tmp = out_jsonl.with_suffix(".jsonl.tmp")
    with tmp.open("w", encoding="utf-8") as f:
        for i in range(n_pdf):
            try:
                text = reader.pages[i].extract_text() or ""
            except Exception as e:
                text = ""
                print(f"{year} p{i+1}: extract error {e}", flush=True)
            ptr_i = pages[i]["pageptr"] if i < n_cpd else None
            rec = {
                "year": year,
                "report_pointer": ptr,
                "page_num": i + 1,
                "page_pointer": ptr_i,
                "obit_link": (f"{BASE}/digital/collection/aogreunion/id/{ptr_i}"
                              if ptr_i else None),
                "text": text,
            }
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    tmp.replace(out_jsonl)
    print(f"{year}: {n_pdf} pages, {pdf_path.stat().st_size//1024}KB pdf", flush=True)


def main():
    only = [int(a) for a in sys.argv[1:]] if len(sys.argv) > 1 else None
    reports = list_reports()
    print(f"{len(reports)} reports found ({reports[0]['year']}-{reports[-1]['year']})",
          flush=True)
    for rep in reports:
        if only and rep["year"] not in only:
            continue
        harvest_report(rep)
        time.sleep(0.5)  # be polite to the library's server
    print("harvest complete", flush=True)


if __name__ == "__main__":
    main()
