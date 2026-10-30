# NOVA — official website

**Live at [nexusrailer432.github.io](https://nexusrailer432.github.io/)**

The website for NOVA 1.0.0, the beginner-friendly programming language.
React 19 + Vite 7 + TypeScript, Tailwind 4, `wouter` routing, and a tiny Express
server for self-hosting.

The site has one rule that shapes everything in it: **it never claims anything
the release does not do.** Code samples are executed against the interpreter
during the build, and the download's size and checksum come from the artefact
that actually ships.

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm check        # typecheck
pnpm build        # static site -> dist/public, server -> dist/index.js
pnpm start        # serve dist/public on $PORT (default 3000)
```

Node 20+ and pnpm 10 are expected.

## How content is produced

Nothing on the site is written twice, and nothing that can be checked is typed
by hand.

| Command | What it does |
| --- | --- |
| `pnpm verify:docs` | Runs **every** code block in `client/src/content/reference.ts` that declares `output`, and fails if the interpreter disagrees. |
| `pnpm capture:lessons` | Runs the ten official lessons through the interpreter and writes `client/src/content/lessons.generated.ts`, including real stdout and any files they create. |
| `python3 scripts/build-release.py` | Zips the released interpreter into `client/public/downloads/`, then writes the real byte count and SHA-256 into `client/src/content/downloads.generated.ts`. |

Both generators look for the interpreter at `../nova/nova.py` and accept an
explicit path:

```bash
pnpm verify:docs -- --nova /path/to/nova/nova.py
python3 scripts/capture-lessons.py --nova /path/to/nova/nova.py
python3 scripts/build-release.py --nova /path/to/nova
```

**When the interpreter changes, re-run all three.** The generated files are
committed so the site builds without the interpreter present, but they must
never be edited by hand — the header in each one says so.

## Project layout

```
client/
  index.html              document shell, meta tags, structured data
  public/
    assets/               logo and banner
    downloads/            the published release archive
    robots.txt sitemap.xml
  src/
    App.tsx               layout, navigation, routes
    content/
      reference.ts        the language reference — the source of truth
      lessons.generated.ts    generated: lesson code + real output
      downloads.generated.ts  generated: artefact size + checksum
    components/           CodeBlock (copy button, highlighter), Inline, ErrorBoundary
    lib/search.ts         in-browser search index over docs and lessons
    pages/                Home, Docs, Learn, Downloads, Search, ContentPages
    index.css             design tokens and all component styles
server/index.ts           Express static server with SPA fallback
scripts/                  capture-lessons.py, build-release.py, verify-docs.ts
```

## Editing the documentation

`client/src/content/reference.ts` is an array of sections, each with typed
blocks (`p`, `code`, `list`, `table`, `note`). Add a block with an `output`
field and `pnpm verify:docs` will execute it against the interpreter and fail
the check if the printed text differs. Inline text supports `` `code` ``,
`**bold**` and `[label](/path)`.

This is why the reference is trustworthy: a wrong output cannot survive a
build.

## Search

`lib/search.ts` builds its index from the same content the pages render, so a
result can never point at text that is not on the site. It scores title matches
above body matches and requires every word in the query. Results deep-link to
`/docs#section` and `/learn#lesson-N`. The query is mirrored into `?q=` so a
search can be shared.

## Accessibility and mobile

- One `h1` per page, landmarks on every page, and a working skip link.
- Visible focus rings on all controls; `prefers-reduced-motion` respected.
- Touch targets are at least 24px, navigation collapses below 800px.
- No horizontal scrolling at 375px, 768px or 1280px — checked by
  `scripts/check-site.cjs`.
- Dark mode follows the toggle, and the choice is stored locally.

## Browser check

`scripts/check-site.cjs` serves `dist/public`, loads all 16 routes at desktop
and phone widths in headless Chromium, and asserts: no console errors, no page
errors, no failed requests, one `h1` per page, no horizontal overflow, the
search flow works, lesson progress persists, the download is really served, and
the theme toggle applies.

```bash
pnpm build
npm i --no-save playwright-core
node scripts/check-site.cjs        # expects chromium on PATH
```

## Deploying

**GitHub Pages (how this repo is published).** The `docs/` folder holds the
built site and Pages is set to serve it from `main` → `/docs`. To update the
live site:

```bash
pnpm build
rm -rf docs && mkdir docs
cp -r dist/public/. docs/
cp docs/index.html docs/404.html   # SPA fallback for /docs, /learn and friends
touch docs/.nojekyll               # stop Jekyll touching the build
```

`404.html` is a copy of `index.html` on purpose: GitHub Pages has no
single-page-app fallback, so without it a hard refresh on `/docs` or
`/learn` returns GitHub's 404 page instead of the app.

**Anywhere else.** See [DEPLOY.md](DEPLOY.md) — deploy `dist/public` as static
files and set `SITE_URL` at build time.

## Security notes

- No credentials, tokens or `.env` files belong in this repository. An earlier
  archive of this project contained a `.project-config.json` with live
  credentials; it has been removed, and **those credentials must be rotated.**
- The site has no backend, no database, no analytics and no third-party
  scripts. Search runs entirely in the browser.
- The only network requests are for the page's own assets.

## License

Not yet decided, matching the interpreter. Until a license is chosen, treat
this as source-available for learning and evaluation.
