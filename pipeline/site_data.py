"""Split dist/necrology.json into static site data:

  site/public/data/index.json     compact search index (all records)
  site/public/data/years/{y}.json full records for one report year, keyed by id
  site/public/data/stats.json     dataset tally for the frontispiece
  site/public/download/*          full DB (sqlite/csv/json) for direct download

Run after build_db.py.
"""

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
OUT = ROOT / "site" / "public" / "data"
DOWNLOAD = ROOT / "site" / "public" / "download"
REPORTS_TOTAL = 72  # 1870-1941, one annual report per year


def index_row(r):
    return {
        "id": r["id"],
        "ln": r.get("last_name") or "",
        "fn": r.get("first_name") or "",
        "mn": r.get("middle_name") or "",
        "raw": r.get("name_raw") or "",
        "cls": r.get("class_year"),
        "clsl": r.get("class_label"),
        "cul": r.get("cullum_number"),
        "dod": r.get("date_of_death"),
        "dodr": r.get("date_of_death_raw"),
        "loc": r.get("location_of_death"),
        "type": r.get("entry_type"),
        "year": r["source_report_year"],
        "page": r.get("page_number"),
    }


def main():
    records = json.loads((DIST / "necrology.json").read_text(encoding="utf-8"))
    (OUT / "years").mkdir(parents=True, exist_ok=True)

    by_year = {}
    for r in records:
        by_year.setdefault(r["source_report_year"], {})[r["id"]] = r

    for year, recs in by_year.items():
        (OUT / "years" / f"{year}.json").write_text(
            json.dumps(recs, ensure_ascii=False), encoding="utf-8")

    index = [index_row(r) for r in records]
    index.sort(key=lambda r: (r["year"], r.get("page") or 0))
    (OUT / "index.json").write_text(
        json.dumps(index, ensure_ascii=False), encoding="utf-8")

    years = sorted(by_year)
    obituaries = sum(1 for r in records if r.get("entry_type") == "obituary")
    stats = {
        "records": len(records),
        "obituaries": obituaries,
        "death_notices": len(records) - obituaries,
        "reports_transcribed": len(years),
        "reports_total": REPORTS_TOTAL,
        "year_min": years[0] if years else None,
        "year_max": years[-1] if years else None,
    }
    (OUT / "stats.json").write_text(json.dumps(stats), encoding="utf-8")

    # Full-database downloads served straight from the static site.
    DOWNLOAD.mkdir(parents=True, exist_ok=True)
    for name in ("necrology.sqlite", "necrology.csv", "necrology.json"):
        src = DIST / name
        if src.exists():
            shutil.copy2(src, DOWNLOAD / name)

    print(f"site data: {len(index)} records, {len(by_year)} year files -> {OUT}")
    print(f"downloads: {', '.join(p.name for p in sorted(DOWNLOAD.glob('*')))} -> {DOWNLOAD}")


if __name__ == "__main__":
    main()
