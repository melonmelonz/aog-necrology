"""Print the list of chunks still needing extraction as a JSON array.

A chunk is "done" when its part file exists in data/extracted/parts/.
Feed this array to the extraction workflow's `args`:

    python pipeline/todo.py            # -> [[year, start, end], ...]
    python pipeline/todo.py --count    # -> "done N / total M, todo K"

1870 is the hand-checked pilot (data/extracted/1870.json) and is skipped.
"""

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "data" / "chunks" / "manifest.json"


def remaining():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    todo, done = [], 0
    for e in manifest:
        if e["year"] == 1870:
            continue
        if os.path.exists(e["part_file"]):
            done += 1
        else:
            todo.append([e["year"], e["start"], e["end"]])
    return todo, done, len(manifest) - 1  # -1 for the 1870 pilot


def main():
    todo, done, total = remaining()
    if "--count" in sys.argv:
        print(f"done {done} / total {total}, todo {len(todo)}")
    else:
        print(json.dumps(todo))


if __name__ == "__main__":
    main()
