# Handoff — NOVA website, post-audit build

Written for whoever picks this up next. The interpreter is untouched: NOVA is
still 1.0.0, frozen, 1061 tests with zero failing. Everything here is the
website.

## What changed in this pass

The audited site was honest but almost entirely placeholders: no real
documentation, a search page that admitted it was not connected, a downloads
page with no download, and platform scaffolding left over from the tool that
generated it.

**Content that now actually exists**

- `/docs` — the complete 19-section language reference, written from the
  release's own `README.md` and checked against the interpreter. Every code
  block that shows output is executed by `pnpm verify:docs`; 31 of 31 match
  NOVA 1.0.0 exactly. Where the README's sample error hint had drifted from
  the real message, the site shows the real one.
- `/learn` — the ten official lessons with their actual source and their
  actual stdout, captured by `pnpm capture:lessons`. Lessons that ask
  questions show the answers that were typed. Progress is stored locally.
- `/downloads` — a real `nova-1.0.0.zip` (60 KB, 44 files), built from the
  release tree, with its real SHA-256 and byte count read from the artefact
  itself. Verified by extracting it and running lesson 1.
- `/search` — real in-browser search over all 29 pages of reference and
  lessons, with deep links into sections, `?q=` in the URL, and an honest
  empty state that points at "what NOVA does not have".

**Removed**

- `.project-config.json` — contained a git token, a JWT secret and API keys.
  **Rotate those credentials.** They travelled in a zip; assume they are
  exposed.
- The Manus runtime: debug log collector Vite plugin, `vite-plugin-manus-runtime`,
  `__manus__` debug script, `manus-storage` asset paths, and the unused OAuth
  stubs (`const.ts`, `contexts/`, `hooks/`).
- 60+ unused dependencies (the entire shadcn/Radix kit, recharts, framer-motion,
  react-hook-form, zod…). The site now depends on React, React DOM, wouter,
  lucide-react and Express — and nothing else.
- Duplicated `dist/` and `production-build/` folders that shipped stale output.

**Added**

- `scripts/capture-lessons.py`, `scripts/build-release.py`,
  `scripts/verify-docs.ts`, `scripts/check-site.cjs`.
- A build-time `SITE_URL` step: canonical link, absolute social images,
  absolute sitemap and robots.txt. One env var, no hand-editing.
- `README.md` and `DEPLOY.md` rewritten for this project.
- Dark mode, mobile navigation, tap targets and horizontal-overflow fixes.

## Verified, not assumed

```
pnpm check                 typecheck, clean
pnpm verify:docs           31/31 documented outputs match NOVA 1.0.0
node scripts/check-site.cjs
                           all 16 routes clean at 1280px and 375px:
                           no console errors, no failed requests,
                           no horizontal scroll, search + progress + download work
pnpm build && PORT=3000 pnpm start
                           SPA fallback and the zip serve correctly
```

## Still open — in the order that unblocks the most

1. **Rotate the leaked credentials.** Nothing else should ship first.
2. **Choose a domain, set `SITE_URL`, deploy `dist/public`.** The site is
   deploy-ready; the pages that are placeholders say so on their face.
3. **Decide the repository and license.** `/community`, `/contributing`,
   `/about` and the footer currently say "not published" and "not decided",
   which is true but will read as unfinished the moment the site is public.
   When those are chosen, update those four places and the footer chip.
4. **Windows runtime.** Still needs a Windows build host. `packaging/nova.spec`
   and `build_windows.ps1` are ready; the downloads page deliberately does not
   mention a build that does not exist. When `nova.exe` exists, add a second
   card to `/downloads` and a second checksum.
5. **`/terms`, `/privacy`, `/contact`** stay placeholders until a legal entity
   and contact address exist. Do not invent them.

## House rules for the next person

- Never hand-edit a `*.generated.ts` file. Re-run its script.
- Never write a code sample's output by hand. Add it to `reference.ts` and let
  `verify:docs` prove it.
- If the interpreter changes, re-run all three generators before building, or
  the site will quietly describe a language that no longer exists.
- Keep the site's honesty: it says "not decided" where nothing is decided, and
  it should keep doing that.
