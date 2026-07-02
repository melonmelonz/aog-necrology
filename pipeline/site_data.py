"""Split dist/necrology.json into static site data:

  site/public/data/index.json     compact search index (all records)
  site/public/data/years/{y}.json full records for one report year, keyed by id

Run after build_db.py.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
OUT = ROOT / "site" / "public" / "data"


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

    print(f"site data: {len(index)} records, {len(by_year)} year files -> {OUT}")


if __name__ == "__main__":
    main()
