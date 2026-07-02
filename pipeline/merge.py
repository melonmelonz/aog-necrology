"""Merge chunk part files (data/extracted/parts/{year}_pNNN-NNN.json) into
per-year files (data/extracted/{year}.json), ordered by page and deduped at
chunk boundaries (same person starting on the same page from two chunks).

Years that already have a full-year file and no parts (e.g. the pilot) are
left untouched.
"""

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARTS = ROOT / "data" / "extracted" / "parts"
OUT = ROOT / "data" / "extracted"


def key(r):
    return (r.get("page_number"),
            (r.get("last_name") or "").lower(),
            (r.get("first_name") or "").lower())


def main():
    by_year = defaultdict(list)
    for path in sorted(PARTS.glob("*.json")):
        m = re.match(r"(\d{4})_p(\d+)-(\d+)", path.stem)
        if not m:
            continue
        year = int(m.group(1))
        try:
            recs = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"BAD JSON, skipping {path.name}: {e}")
            continue
        by_year[year].extend(recs)

    total = 0
    for year, recs in sorted(by_year.items()):
        seen, deduped = set(), []
        recs.sort(key=lambda r: (r.get("page_number") or 0))
        for r in recs:
            k = key(r)
            if k in seen:
                continue
            seen.add(k)
            r["source_report_year"] = year
            deduped.append(r)
        (OUT / f"{year}.json").write_text(
            json.dumps(deduped, ensure_ascii=False, indent=1), encoding="utf-8")
        dropped = len(recs) - len(deduped)
        total += len(deduped)
        print(f"{year}: {len(deduped)} records"
              + (f" ({dropped} boundary dupes dropped)" if dropped else ""))
    print(f"total: {total} records across {len(by_year)} years")


if __name__ == "__main__":
    main()
