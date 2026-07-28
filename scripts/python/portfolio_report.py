#!/usr/bin/env python3
"""
portfolio_report.py
===================

Print a small textual summary of the repository:

* File count per extension
* Approximate lines of code per extension (skips binaries)
* Top 10 largest text files

Ignores common build/output directories: node_modules, dist, .output, .vinxi,
.git, .venv.

Usage
-----

    python3 scripts/python/portfolio_report.py
    python3 scripts/python/portfolio_report.py --root .

No third-party dependencies.
"""

from __future__ import annotations

import argparse
from collections import defaultdict
from pathlib import Path

IGNORED_DIRS = {
    "node_modules",
    "dist",
    ".output",
    ".vinxi",
    ".git",
    ".venv",
    ".next",
    ".turbo",
    ".cache",
}

BINARY_EXTS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".pdf",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".zip",
    ".gz",
    ".mp4",
    ".mp3",
}


def walk(root: Path):
    for path in root.rglob("*"):
        if any(part in IGNORED_DIRS for part in path.parts):
            continue
        if path.is_file():
            yield path


def count_lines(path: Path) -> int:
    try:
        with path.open("rb") as fh:
            return sum(1 for _ in fh)
    except OSError:
        return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument("--root", type=Path, default=Path("."))
    args = parser.parse_args()

    ext_files: dict[str, int] = defaultdict(int)
    ext_lines: dict[str, int] = defaultdict(int)
    file_sizes: list[tuple[int, Path]] = []

    for path in walk(args.root):
        ext = path.suffix.lower() or "(none)"
        ext_files[ext] += 1
        if ext not in BINARY_EXTS:
            ext_lines[ext] += count_lines(path)
            try:
                file_sizes.append((path.stat().st_size, path))
            except OSError:
                pass

    print(f"Repository summary for {args.root.resolve()}\n")
    print(f"{'Ext':<12}{'Files':>8}{'Lines':>12}")
    print("-" * 32)
    for ext in sorted(ext_files, key=lambda e: -ext_files[e]):
        print(f"{ext:<12}{ext_files[ext]:>8}{ext_lines.get(ext, 0):>12}")

    print("\nTop 10 largest text files:")
    for size, path in sorted(file_sizes, reverse=True)[:10]:
        print(f"  {size:>10,} bytes  {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
