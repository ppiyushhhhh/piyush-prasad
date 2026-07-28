#!/usr/bin/env python3
"""
image_optimizer.py
==================

Recursively optimize JPEG/PNG images in a directory using Pillow.

For each supported image:

* JPEGs are re-encoded with ``quality=<q>``, ``optimize=True``, and
  ``progressive=True``.
* PNGs are re-encoded with ``optimize=True``.

By default the script performs a *dry run* and only reports the potential
savings. Pass ``--write`` to overwrite files in place.

Usage
-----

    python3 scripts/python/image_optimizer.py public/
    python3 scripts/python/image_optimizer.py public/ --write --quality 82

Requires: Pillow (``pip install Pillow``).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    print("Pillow is required. Install with: pip install Pillow", file=sys.stderr)
    raise SystemExit(2)


SUPPORTED = {".jpg", ".jpeg", ".png"}


def iter_images(root: Path):
    for path in root.rglob("*"):
        if path.suffix.lower() in SUPPORTED and path.is_file():
            yield path


def optimize(path: Path, quality: int, write: bool) -> tuple[int, int]:
    """Return (original_size, new_size). Writes in place when ``write`` is true."""
    original = path.stat().st_size
    with Image.open(path) as img:
        img.load()
        ext = path.suffix.lower()
        tmp = path.with_suffix(path.suffix + ".tmp")
        if ext in {".jpg", ".jpeg"}:
            img.convert("RGB").save(
                tmp, "JPEG", quality=quality, optimize=True, progressive=True
            )
        else:  # .png
            img.save(tmp, "PNG", optimize=True)
    new_size = tmp.stat().st_size
    if write and new_size < original:
        tmp.replace(path)
    else:
        tmp.unlink(missing_ok=True)
    return original, new_size


def human(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument("root", type=Path, help="Directory to scan")
    parser.add_argument("--quality", type=int, default=85, help="JPEG quality (1-95)")
    parser.add_argument(
        "--write", action="store_true", help="Overwrite files in place when smaller"
    )
    args = parser.parse_args()

    if not args.root.is_dir():
        print(f"error: not a directory: {args.root}", file=sys.stderr)
        return 1

    total_before = 0
    total_after = 0
    count = 0

    for image_path in iter_images(args.root):
        before, after = optimize(image_path, args.quality, args.write)
        total_before += before
        total_after += min(before, after)
        count += 1
        delta = before - after
        arrow = "→" if args.write else "≈"
        print(
            f"{image_path}: {human(before)} {arrow} {human(after)} "
            f"(save {human(max(delta, 0))})"
        )

    if count == 0:
        print("No supported images found.")
        return 0

    saved = total_before - total_after
    print("-" * 60)
    print(
        f"Scanned {count} file(s). "
        f"Total: {human(total_before)} → {human(total_after)} "
        f"(save {human(max(saved, 0))})"
    )
    if not args.write:
        print("Dry run. Re-run with --write to apply changes.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
