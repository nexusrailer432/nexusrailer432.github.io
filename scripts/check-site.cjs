/**
 * End-to-end check for the built site.
 *
 *   pnpm build
 *   npm i --no-save playwright-core
 *   node scripts/check-site.cjs
 *
 * Set CHROME_PATH to use a specific browser binary.
 *
 * Serves dist/public, then loads every route in a real Chromium, collecting
 * console errors, page errors and failed requests. Also exercises the
 * interactive parts: mobile navigation, search, lesson progress and the
 * documentation anchors. Checks for horizontal overflow at phone width.
 */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const ROOT = path.resolve(__dirname, "..", "dist", "public");
// Not PORT: hosting platforms set that, and it may already be taken.
const PORT = Number(process.env.NOVA_CHECK_PORT ?? 4188);
const CHROME = process.env.CHROME_PATH ?? undefined;

const ROUTES = [
  ["/", "Programming that feels like"],
  ["/learn", "Start with the essentials"],
  ["/docs", "The NOVA handbook"],
  ["/downloads", "Get NOVA 1.0.0"],
  ["/search", "Find your way around"],
  ["/packages", "An ecosystem can come later"],
  ["/community", "Make NOVA better together"],
  ["/news", "A project in the open"],
  ["/contributing", "Help shape what NOVA becomes"],
  ["/about", "A more approachable way to begin"],
  ["/security", "How NOVA handles trust"],
  ["/terms", "Terms of Service"],
  ["/privacy", "Privacy Policy"],
  ["/contact", "Contact NOVA"],
  ["/sitemap", "Every page on this site"],
  ["/does-not-exist", "That page doesn’t exist"],
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".zip": "application/zip",
  ".json": "application/json",
};

function serve() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
    const candidate = path.join(ROOT, url);
    const file = fs.existsSync(candidate) && fs.statSync(candidate).isFile()
      ? candidate
      : path.join(ROOT, "index.html");
    const body = fs.readFileSync(file);
    res.writeHead(200, {
      "content-type": MIME[path.extname(file)] ?? "application/octet-stream",
      "content-length": body.length,
    });
    res.end(body);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

const problems = [];
const note = (message) => {
  problems.push(message);
  console.log(`  ✗ ${message}`);
};

(async () => {
  const server = await serve();
  if (!fs.existsSync(ROOT)) {
    console.error("  dist/public is missing — run `pnpm build` first.");
    process.exit(1);
  }
  const browser = await chromium.launch({
    ...(CHROME ? { executablePath: CHROME } : {}),
    args: ["--no-sandbox"],
  });

  // ---- desktop route sweep -------------------------------------------------
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  let consoleErrors = [];
  let pageErrors = [];
  let failedRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`${message.text()}`);
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "";
    if (!failure.includes("ERR_ABORTED")) failedRequests.push(`${request.url()} ${failure}`);
  });

  for (const [route, expected] of ROUTES) {
    consoleErrors = [];
    pageErrors = [];
    failedRequests = [];

    const response = await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: "networkidle" });
    if (response?.status() !== 200) note(`${route} returned ${response?.status()}`);

    const text = await page.locator("#main").innerText();
    if (!text.includes(expected)) note(`${route} is missing "${expected}"`);

    const h1 = await page.locator("#main h1").count();
    if (h1 !== 1) note(`${route} has ${h1} h1 elements (expected 1)`);

    for (const error of pageErrors) note(`${route} threw: ${error}`);
    for (const error of consoleErrors) note(`${route} console error: ${error}`);
    for (const failure of failedRequests) note(`${route} failed request: ${failure}`);

    // Horizontal overflow is the classic mobile bug; check it on every route.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) note(`${route} scrolls horizontally by ${overflow}px at 1280px`);
  }

  // ---- deep link into documentation ---------------------------------------
  await page.goto(`http://127.0.0.1:${PORT}/docs#lists`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  const listsVisible = await page.evaluate(() => {
    const element = document.getElementById("lists");
    if (!element) return false;
    const box = element.getBoundingClientRect();
    return box.top > -200 && box.top < 400;
  });
  if (!listsVisible) note("/docs#lists did not scroll to the section");

  // ---- every documented output is rendered --------------------------------
  const outputPanels = await page.locator(".code-output").count();
  if (outputPanels < 20) note(`/docs rendered only ${outputPanels} output panels`);

  // ---- copy button works --------------------------------------------------
  const copyButton = page.locator(".copy-button").first();
  await copyButton.click();
  await page.waitForTimeout(250);
  const copiedLabel = await copyButton.innerText();
  if (!/Copied/i.test(copiedLabel)) note("copy button did not confirm the copy");

  // ---- search -------------------------------------------------------------
  await page.goto(`http://127.0.0.1:${PORT}/search`, { waitUntil: "networkidle" });
  await page.locator(".search-form input").fill("newline");
  await page.waitForTimeout(250);
  const resultCount = await page.locator(".result").count();
  if (resultCount === 0) note("search returned no results for 'newline'");

  await page.locator(".search-form input").fill("zzzznothing");
  await page.waitForTimeout(250);
  if ((await page.locator(".search-empty").count()) === 0) note("search empty state did not appear");

  await page.locator(".search-form input").fill("lists");
  await page.waitForTimeout(250);
  await page.locator(".result").first().click();
  await page.waitForTimeout(400);
  if (!page.url().includes("/docs") && !page.url().includes("/learn")) {
    note(`search result navigated to ${page.url()}`);
  }

  // ---- lesson progress persists ------------------------------------------
  await page.goto(`http://127.0.0.1:${PORT}/learn`, { waitUntil: "networkidle" });
  await page.locator(".done-button").first().click();
  await page.waitForTimeout(200);
  const progressText = await page.locator(".progress-copy strong").innerText();
  if (!progressText.startsWith("1 of")) note(`progress did not update: ${progressText}`);

  await page.reload({ waitUntil: "networkidle" });
  const afterReload = await page.locator(".progress-copy strong").innerText();
  if (!afterReload.startsWith("1 of")) note(`progress did not persist: ${afterReload}`);

  // ---- download artefact is real -----------------------------------------
  await page.goto(`http://127.0.0.1:${PORT}/downloads`, { waitUntil: "networkidle" });
  const downloadHref = await page.locator("a.download-button").getAttribute("href");
  const zip = await page.request.get(`http://127.0.0.1:${PORT}${downloadHref}`);
  const zipSize = (await zip.body()).length;
  if (zip.status() !== 200) note(`download returned ${zip.status()}`);
  if (zipSize < 20000) note(`download is only ${zipSize} bytes`);

  // ---- dark mode ----------------------------------------------------------
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });
  await page.locator(".theme-toggle").click();
  await page.waitForTimeout(200);
  const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  if (!isDark) note("theme toggle did not enable dark mode");

  // ---- mobile -------------------------------------------------------------
  const mobile = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  const phone = await mobile.newPage();
  const mobileErrors = [];
  phone.on("pageerror", (error) => mobileErrors.push(error.message));

  for (const [route, expected] of ROUTES) {
    await phone.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: "networkidle" });
    const text = await phone.locator("#main").innerText();
    if (!text.includes(expected)) note(`mobile ${route} is missing "${expected}"`);

    const overflow = await phone.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) note(`mobile ${route} scrolls horizontally by ${overflow}px`);
  }
  for (const error of mobileErrors) note(`mobile threw: ${error}`);

  // mobile navigation opens and closes
  await phone.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });
  await phone.locator(".menu-button").click();
  await phone.waitForTimeout(250);
  const navOpen = await phone.locator(".main-nav.open").count();
  if (navOpen !== 1) note("mobile menu did not open");
  await phone.locator(".main-nav a", { hasText: "Docs" }).first().click();
  await phone.waitForTimeout(400);
  if (!phone.url().endsWith("/docs")) note(`mobile nav went to ${phone.url()}`);

  // touch targets: nothing interactive smaller than 24px
  const smallTargets = await phone.evaluate(() => {
    const nodes = [...document.querySelectorAll("a, button, input")];
    return nodes
      .filter((node) => {
        const box = node.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return false;
        // The skip link is deliberately parked off-screen until focused.
        if (node.classList.contains("skip-link")) return false;
        // Inline links inside prose are text, not buttons; the rule targets controls.
        if (node.tagName === "A" && node.closest("p, li, .doc-columns, .footer-grid, .link-list"))
          return false;
        return box.height < 24 || box.width < 24;
      })
      .map((node) => `${node.tagName.toLowerCase()}.${node.className || "(no class)"}`)
      .slice(0, 6);
  });
  if (smallTargets.length) note(`small touch targets: ${smallTargets.join(", ")}`);

  await browser.close();
  server.close();

  console.log(
    problems.length === 0
      ? `\n  All ${ROUTES.length} routes clean at desktop and mobile, interactions working.`
      : `\n  ${problems.length} problem(s) found.`,
  );
  process.exit(problems.length === 0 ? 0 : 1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
