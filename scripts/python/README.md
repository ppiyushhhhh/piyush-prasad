# Python Utilities

Small, standalone helpers used for repository housekeeping. They are **not**
invoked by the React app, the Vite build, or any deployment pipeline — run
them manually from the command line when needed.

## Requirements

- Python 3.9+
- Optional: [`Pillow`](https://pypi.org/project/Pillow/) for `image_optimizer.py`

Install optional deps in a local virtualenv:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install Pillow
```

## Scripts

| Script                  | Purpose                                                              |
|-------------------------|----------------------------------------------------------------------|
| `sitemap_validator.py`  | Validate a `sitemap.xml` file — checks XML shape and URL reachability. |
| `image_optimizer.py`    | Recompress images in a folder (JPEG/PNG) using Pillow.               |
| `markdown_stats.py`     | Report word/heading/link counts across Markdown files.               |
| `portfolio_report.py`   | Print a small summary of the repository (files, LOC by extension).   |

Each script supports `--help`:

```bash
python3 scripts/python/sitemap_validator.py --help
```

None of these scripts modify application source. They are safe to run,
delete, or ignore.
