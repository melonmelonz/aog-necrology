"""Compile data/extracted/{year}.json files into consumable formats:

  dist/necrology.sqlite  - SQLite with FTS5 full-text index
  dist/necrology.csv     - flat CSV
  dist/necrology.json    - full JSON array

Run after any extraction batch; rebuilds from scratch each time.
"""

import csv
import json
import sqlite3
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXTRACTED = ROOT / "data" / "extracted"
DIST = ROOT / "dist"

COLUMNS = [
    "id", "last_name", "first_name", "middle_name", "name_raw",
    "class_year", "class_label", "cullum_number",
    "date_of_death", "date_of_death_raw", "location_of_death", "age_at_death",
    "date_of_birth", "date_of_birth_raw", "interment_location",
    "entry_type", "obit_text", "author",
    "source_report_year", "page_number", "page_end", "obit_link",
    "source_item_id", "status", "confidence", "confidence_notes", "needs_vision",
]


def load_records():
    records = []
    for path in sorted(EXTRACTED.glob("*.json")):
        year_records = json.loads(path.read_text(encoding="utf-8"))
        for r in year_records:
            r.setdefault("status", "draft")
            r.setdefault("source_item_id",
                         (r.get("obit_link") or "").rstrip("/").rsplit("/", 1)[-1] or None)
            # stable id: derived from source, so rebuilds don't churn ids
            key = f"{r.get('source_report_year')}|{r.get('page_number')}|{r.get('cullum_number')}|{r.get('last_name')}|{r.get('first_name')}"
            r["id"] = str(uuid.uuid5(uuid.NAMESPACE_URL, "aog-necrology:" + key))
            records.append(r)
    return records


def build_sqlite(records):
    db_path = DIST / "necrology.sqlite"
    db_path.unlink(missing_ok=True)
    con = sqlite3.connect(db_path)
    cols_sql = ", ".join(f"{c} TEXT" if c not in
                         ("class_year", "age_at_death", "source_report_year",
                          "page_number", "page_end")
                         else f"{c} INTEGER" for c in COLUMNS)
    con.execute(f"CREATE TABLE entries ({cols_sql}, PRIMARY KEY (id))")
    con.executemany(
        f"INSERT INTO entries VALUES ({','.join('?' for _ in COLUMNS)})",
        [[r.get(c) if not isinstance(r.get(c), bool) else int(r.get(c))
          for c in COLUMNS] for r in records])
    con.execute("""CREATE VIRTUAL TABLE entries_fts USING fts5(
        last_name, first_name, middle_name, obit_text,
        content='entries', content_rowid='rowid')""")
    con.execute("""INSERT INTO entries_fts(rowid, last_name, first_name, middle_name, obit_text)
        SELECT rowid, last_name, first_name, middle_name, obit_text FROM entries""")
    con.execute("CREATE INDEX idx_last_name ON entries(last_name)")
    con.execute("CREATE INDEX idx_class_year ON entries(class_year)")
    con.execute("CREATE INDEX idx_report_year ON entries(source_report_year)")
    con.commit()
    con.close()
    return db_path


def main():
    DIST.mkdir(exist_ok=True)
    records = load_records()
    if not records:
        print("no extracted years found in data/extracted/")
        return

    (DIST / "necrology.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=1), encoding="utf-8")

    with (DIST / "necrology.csv").open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS, extrasaction="ignore")
        w.writeheader()
        w.writerows(records)

    db = build_sqlite(records)

    years = sorted({r["source_report_year"] for r in records})
    print(f"{len(records)} records from {len(years)} report years "
          f"({years[0]}-{years[-1]})")
    print(f"wrote dist/necrology.json, dist/necrology.csv, {db.name}")


if __name__ == "__main__":
    main()
