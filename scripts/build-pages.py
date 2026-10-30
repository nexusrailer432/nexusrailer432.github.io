#!/usr/bin/env python3
"""
Build the folder GitHub Pages serves: docs/

GitHub Pages is a static host with no rewrite rules, so a single-page app
needs two things to survive a refresh:

1. an `index.html` in a folder for every route (`docs/learn/index.html`,
   `docs/downloads/index.html`, …), so a hard refresh on `/learn` returns
   200 and the app boots at that URL;
2. a `404.html` copy of the shell, so any path we did not think of still
   loads the app instead of GitHub's own 404 page.

`.nojekyll` stops Jekyll from touching the build output.

Usage:
    pnpm build
    python3 scripts/build-pages.py            # dist/public -> docs/
    python3 scripts/build-pages.py --out site # somewhere else

Then commit docs/ and push; Pages is configured to serve main -> /docs.
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "dist" / "public"

# Every client route in client/src/App.tsx. Keep in step with the router.
ROUTES = [
    "learn",
    "docs",
    "downloads",
    "search",
    "packages",
    "community",
    "news",
    "contributing",
    "about",
    "security",
    "terms",
    "privacy",
    "contact",
    "sitemap",
]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default="docs", help="output folder (default: docs)")
    parser.add_argument("--source", default=str(SOURCE), help="built site to publish")
    args = parser.parse_args()

    source = Path(args.source).resolve()
    target = (ROOT / args.out).resolve()

    index = source / "index.html"
    if not index.is_file():
        sys.exit(f"No index.html in {source} — run `pnpm build` first.")

    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(source, target)

    # Jekyll ignores files it does not understand; .nojekyll turns it off.
    (target / ".nojekyll").write_text("", encoding="utf-8")

    shell = index.read_text(encoding="utf-8")

    # A folder per route so deep links return 200, not 404.
    for route in ROUTES:
        folder = target / route
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "index.html").write_text(shell, encoding="utf-8")

    # Anything else still boots the app rather than showing GitHub's 404.
    (target / "404.html").write_text(shell, encoding="utf-8")

    # Stray placeholder files are not part of the site.
    for stray in target.rglob(".gitkeep"):
        stray.unlink()

    written = sum(1 for path in target.rglob("*") if path.is_file())
    size = sum(path.stat().st_size for path in target.rglob("*") if path.is_file())
    print(f"  {target.relative_to(ROOT)}: {written} files, {size / 1024:.0f} KB")
    print(f"  routes with their own index.html: {len(ROUTES)}")
    print("  commit this folder; Pages serves main -> /docs")


if __name__ == "__main__":
    main()
