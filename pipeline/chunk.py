"""Split each harvested year into agent-sized chunks for the extraction fleet.

Each chunk is a plain-text file of ~CHUNK pages plus a TAIL of continuation
pages, with clear page separators carrying the CONTENTdm pointer and deep
link. An agent extracts only entries that BEGIN in its assigned range; the
tail pages let it finish an obituary that runs past the range boundary.

Outputs:
  data/chunks/{year}_p{start:03d}-{end:03d}.txt
  data/chunks/manifest.json   [{year, start, end, pages, chunk_file, part_file}]
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "data" / "pages"
CHUNKS = ROOT / "data" / "chunks"
CHUNK = 60   # pages an agent is responsible for
TAIL = 12    # extra continuation pages appended (not the agent's responsibility)


def page_header(rec, in_range):
    tag = "" if in_range else "  [CONTINUATION ONLY - do not start new entries here]"
    return (f"\n===== PAGE {rec['page_num']} "
            f"(pointer {rec['page_pointer']}, link {rec['obit_link']}) ====={tag}\n")


def main():
    CHUNKS.mkdir(exist_ok=True)
    manifest = []
    for path in sorted(PAGES.glob("*.jsonl")):
        year = int(path.stem)
        pages = [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines()]
        n = len(pages)
        start = 1
        while start <= n:
            end = min(start + CHUNK - 1, n)
            # avoid a tiny orphan final chunk
            if n - end < CHUNK // 3:
                end = n
            tail_end = min(end + TAIL, n)
            name = f"{year}_p{start:03d}-{end:03d}"
            out = CHUNKS / f"{name}.txt"
            with out.open("w", encoding="utf-8") as f:
                f.write(f"REPORT YEAR {year} - pages {start}-{end} of {n}"
                        f" (continuation pages through {tail_end} included)\n")
                for rec in pages[start - 1:tail_end]:
                    f.write(page_header(rec, start <= rec["page_num"] <= end))
                    f.write(rec["text"].strip() + "\n")
            manifest.append({
                "year": year, "start": start, "end": end, "pages": n,
                "chunk_file": str(out),
                "part_file": str(ROOT / "data" / "extracted" / "parts" /
                                 f"{name}.json"),
            })
            start = end + 1
    (CHUNKS / "manifest.json").write_text(
        json.dumps(manifest, indent=1), encoding="utf-8")
    (ROOT / "data" / "extracted" / "parts").mkdir(parents=True, exist_ok=True)
    years = len({m['year'] for m in manifest})
    print(f"{len(manifest)} chunks across {years} years -> data/chunks/")


if __name__ == "__main__":
    main()
