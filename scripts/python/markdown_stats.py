#!/usr/bin/env python3
"""
markdown_stats.py
=================

Walk a directory and print statistics for every ``*.md`` file:

* Word count
* Heading count (by level)
* Link count
* Code-fence count

Usage
-----

    python3 scripts/python/markdown_stats.py .
    python3 scripts/python/markdown_stats.py docs/ --json

No third-party dependencies.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, asdict
from pathlib import Path

HEADING_RE = re.compile(r"^(#{1,6})\s+\S", re.MULTILINE)
LINK_RE = re.compile(r"\[[^\]]+\]\([^)]+\)")
FENCE_RE = re.compile(r"^```", re.MULTILINE)
WORD_RE = re.compile(r"\b[\w'-]+\b", re.UNICODE)


@dataclass
class Stats:
    path: str
    words: int
    headings: dict[str, int]
    links: int
    code_fences: int


def analyse(text: str, path: Path) -> Stats:
    headings: dict[str, int] = {}
    for match in HEADING_RE.finditer(text):
        level = f"h{len(match.group(1))}"
        headings[level] = headings.get(level, 0) + 1
    return Stats(
        path=str(path),
        words=len(WORD_RE.findall(text)),
        headings=dict(sorted(headings.items())),
        links=len(LINK_RE.findall(text)),
        code_fences=len(FENCE_RE.findall(text)) // 2,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument("root", type=Path, help="Directory to scan")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON")
    args = parser.parse_args()

    if not args.root.exists():
        print(f"error: {args.root} does not exist", file=sys.stderr)
        return 1

    results: list[Stats] = []
    for md_path in sorted(args.root.rglob("*.md")):
        try:
            text = md_path.read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            print(f"skip {md_path}: {exc}", file=sys.stderr)
            continue
        results.append(analyse(text, md_path))

    if args.json:
        print(json.dumps([asdict(r) for r in results], indent=2))
        return 0

    total_words = sum(r.words for r in results)
    for r in results:
        print(f"{r.path}")
        print(
            f"  words={r.words}  links={r.links}  fences={r.code_fences}  "
            f"headings={r.headings or '{}'}"
        )
    print("-" * 60)
    print(f"{len(results)} file(s), {total_words} total words")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
