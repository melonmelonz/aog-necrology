"""Show pipeline progress: which of the 72 report years are harvested/extracted."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
YEARS = range(1870, 1942)

harvested = {int(p.stem) for p in (ROOT / "data" / "pages").glob("*.jsonl")}
extracted = {int(p.stem) for p in (ROOT / "data" / "extracted").glob("*.json")}

n_records = 0
for p in (ROOT / "data" / "extracted").glob("*.json"):
    try:
        n_records += len(json.loads(p.read_text(encoding="utf-8")))
    except Exception:
        pass

missing_h = [y for y in YEARS if y not in harvested]
missing_e = [y for y in YEARS if y not in extracted]

print(f"harvested: {len(harvested)}/72" + (f"  missing: {missing_h}" if missing_h else ""))
print(f"extracted: {len(extracted)}/72  ({n_records} records)")
if missing_e:
    print(f"next to extract: {missing_e[:15]}{' ...' if len(missing_e) > 15 else ''}")
