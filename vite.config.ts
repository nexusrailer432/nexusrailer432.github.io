import fs from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const ROOT = import.meta.dirname;
const OUT_DIR = path.resolve(ROOT, "dist", "public");

const ROUTES = [
  "/",
  "/learn",
  "/docs",
  "/downloads",
  "/packages",
  "/community",
  "/news",
  "/contributing",
  "/about",
  "/security",
  "/contact",
  "/terms",
  "/privacy",
  "/search",
  "/sitemap",
];

/**
 * Absolute URLs are only possible once a domain exists.
 *
 * Set SITE_URL (for example https://nova-lang.dev) at build time and this
 * plugin produces a canonical link, absolute social images, a sitemap with
 * absolute locations and a robots.txt that points at it. With SITE_URL
 * unset the build still works — it simply ships the relative placeholders.
 */
function absoluteUrls(): Plugin {
  let siteUrl = "";

  return {
    name: "nova-absolute-urls",

    configResolved(config) {
      const raw = (process.env.SITE_URL ?? "").trim().replace(/\/+$/, "");
      if (!raw) return;
      if (!/^https?:\/\//.test(raw)) {
        config.logger.warn(`SITE_URL must start with http(s):// — ignoring "${raw}"`);
        return;
      }
      siteUrl = raw;
    },

    transformIndexHtml(html) {
      if (!siteUrl) return html;

      const banner = `${siteUrl}/assets/nova-banner.jpg`;
      return html
        .replace('<link rel="canonical"', "<link rel=\"canonical\"")
        .replace("</head>", `    <link rel="canonical" href="${siteUrl}/" />\n  </head>`)
        .replace('content="/assets/nova-banner.jpg"', `content="${banner}"`)
        .replace(
          '<meta property="og:type" content="website" />',
          `<meta property="og:type" content="website" />\n    <meta property="og:url" content="${siteUrl}/" />`,
        );
    },

    writeBundle() {
      if (!siteUrl) return;

      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...ROUTES.map((route) => `  <url><loc>${siteUrl}${route === "/" ? "/" : route}</loc></url>`),
        "</urlset>",
        "",
      ].join("\n");
      fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), sitemap, "utf-8");

      const robots = [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${siteUrl}/sitemap.xml`,
        "",
      ].join("\n");
      fs.writeFileSync(path.join(OUT_DIR, "robots.txt"), robots, "utf-8");
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), absoluteUrls()],
  resolve: {
    alias: {
      "@": path.resolve(ROOT, "client", "src"),
    },
  },
  root: path.resolve(ROOT, "client"),
  publicDir: path.resolve(ROOT, "client", "public"),
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
    assetsInlineLimit: 2048,
  },
  server: {
    port: 5173,
  },
});
