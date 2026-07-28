#!/usr/bin/env python3
"""
sitemap_validator.py
====================

Validate a sitemap.xml file:

1. Parse the XML and confirm it uses the sitemaps.org namespace.
2. Extract every ``<loc>`` URL.
3. Optionally issue a HEAD request for each URL and report the status code.

Usage
-----

    python3 scripts/python/sitemap_validator.py public/sitemap.xml
    python3 scripts/python/sitemap_validator.py https://example.com/sitemap.xml --check

This script has no third-party dependencies.
"""

from __future__ import annotations

import argparse
import sys
import urllib.request
import urllib.error
from pathlib import Path
from xml.etree import ElementTree as ET

SITEMAP_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"


def load_source(source: str) -> bytes:
    """Read a sitemap from disk or HTTP(S)."""
    if source.startswith(("http://", "https://")):
        with urllib.request.urlopen(source, timeout=15) as resp:
            return resp.read()
    path = Path(source)
    if not path.is_file():
        raise FileNotFoundError(source)
    return path.read_bytes()


def extract_urls(xml_bytes: bytes) -> list[str]:
    root = ET.fromstring(xml_bytes)
    if not root.tag.endswith("urlset"):
        raise ValueError(f"Unexpected root element: {root.tag}")
    return [
        (loc.text or "").strip()
        for loc in root.iter(f"{SITEMAP_NS}loc")
        if loc.text and loc.text.strip()
    ]


def check_url(url: str, timeout: float = 10.0) -> int:
    req = urllib.request.Request(url, method="HEAD")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status
    except urllib.error.HTTPError as exc:
        return exc.code
    except Exception:
        return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument("source", help="Path or URL to a sitemap.xml")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Send HEAD requests to each URL and print the status code.",
    )
    args = parser.parse_args()

    try:
        raw = load_source(args.source)
        urls = extract_urls(raw)
    except Exception as exc:  # pragma: no cover
        print(f"error: {exc}", file=sys.stderr)
        return 1

    print(f"Found {len(urls)} URL(s) in {args.source}")
    for url in urls:
        if args.check:
            code = check_url(url)
            marker = "OK " if 200 <= code < 400 else "!! "
            print(f"  {marker}{code:>3}  {url}")
        else:
            print(f"  - {url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
