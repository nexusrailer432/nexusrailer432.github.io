# Deploying the NOVA website

The site is a static single-page app. There is no database, no API and no
server-side rendering, so it runs anywhere that serves files.

## 1. Build

```bash
pnpm install
pnpm check                       # typecheck
SITE_URL=https://your-domain.tld pnpm build
```

`SITE_URL` is optional but you want it in production. With it set, the build
writes a canonical link, absolute `og:image` / `twitter:image`, `og:url`, a
`sitemap.xml` with absolute locations, and a `robots.txt` pointing at the
sitemap. Without it, the build still succeeds and ships the relative
placeholders.

Output:

```
dist/public/       the deployable site
dist/index.js      optional Node server (SPA fallback)
```

## 2. Deploy the static files

Any of these work; pick one.

**Netlify** — build command `pnpm build`, publish directory `dist/public`.
Environment: `SITE_URL`. Add a redirect so client routes resolve:

```
/*  /index.html  200
```

**Vercel** — framework preset "Vite", output directory `dist/public`, env
`SITE_URL`. Add a rewrite of all paths to `/index.html`.

**Cloudflare Pages** — build `pnpm build`, output `dist/public`, env
`SITE_URL`. Set a single-page-app fallback in the dashboard.

**GitHub Pages** — needs a `404.html` copy of `index.html` for deep links, and
a `base` in `vite.config.ts` if you serve from a subpath.

**Your own box** — `pnpm build && PORT=3000 pnpm start`. The Express server
serves `dist/public` and falls back to `index.html` for unknown paths, which is
what a client-routed SPA needs.

## 3. Domain checklist

Before announcing the URL:

- [ ] `SITE_URL` set, so canonical and social URLs are absolute.
- [ ] `dist/public/sitemap.xml` lists the production domain.
- [ ] `dist/public/robots.txt` points at that sitemap.
- [ ] HTTPS on, HTTP redirecting to it.
- [ ] `/downloads/nova-1.0.0.zip` downloads and its checksum matches the value
      printed on the downloads page.
- [ ] Deep links work on a hard refresh: `/docs#lists`, `/learn#lesson-4`,
      `/search?q=newline`, and a nonsense path showing the 404 page.
- [ ] Cache headers: hashed files under `/assets/` are immutable;
      `index.html` must revalidate.
- [ ] Social preview renders — paste the URL into a card validator and check
      the banner image resolves absolutely.

## 4. Re-releasing NOVA

When the interpreter changes, in this order:

```bash
pnpm capture:lessons                          # real lesson output
python3 scripts/build-release.py              # new zip + real checksum
pnpm verify:docs                              # every documented output
pnpm check && SITE_URL=... pnpm build
node scripts/check-site.cjs                   # browser sweep
```

Then update the version string in `client/src/pages/*` if it changed, and
republish. The download page reads its numbers from the generated file, so it
cannot advertise a stale size or hash.

## 5. What is deliberately not here

No analytics, no cookie banner, no newsletter form, no chat widget, no
third-party fonts or scripts. If any of those are added later they change the
privacy story, and `/privacy` must stop being a placeholder at that point.

The pages `/terms`, `/privacy` and `/contact` are honest placeholders. Do not
publish a legal entity, address or license that has not actually been chosen.

## 6. Credentials

The original archive of this site contained `.project-config.json` holding a
git token, a JWT secret and API keys. It is not in this repository and must
never be committed. **Rotate those credentials** — they were distributed in a
zip, so assume they are exposed. `.gitignore` already excludes
`.project-config.json` and every `.env*` file.
