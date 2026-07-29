#!/usr/bin/env node
// Builds dist/ from experiments/*/index.html — no external dependencies.
import { execSync } from "node:child_process";
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const EXPERIMENTS_DIR = join(ROOT, "experiments");
const DIST_DIR = join(ROOT, "dist");

function extractTag(html, regex, fallback = "") {
  const match = html.match(regex);
  return match ? match[1].trim() : fallback;
}

function getMetadata(slug, html) {
  const title = extractTag(html, /<title>([^<]*)<\/title>/i, slug);
  const description = extractTag(
    html,
    /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i,
  );
  const tagsRaw = extractTag(
    html,
    /<meta\s+name=["']experiment:tags["']\s+content=["']([^"']*)["']/i,
  );
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const dateMeta = extractTag(
    html,
    /<meta\s+name=["']experiment:date["']\s+content=["']([^"']*)["']/i,
  );
  return { title, description, tags, dateMeta };
}

function getLastModified(slug, dateMeta) {
  if (dateMeta) return dateMeta;
  try {
    const out = execSync(
      `git log -1 --format=%aI -- ${JSON.stringify(join("experiments", slug))}`,
      { cwd: ROOT, encoding: "utf8" },
    ).trim();
    if (out) return out.slice(0, 10);
  } catch {
    // no git history available (e.g. fresh checkout without history) — fall through
  }
  return new Date().toISOString().slice(0, 10);
}

function discoverExperiments() {
  let entries;
  try {
    entries = readdirSync(EXPERIMENTS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  const experiments = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const indexPath = join(EXPERIMENTS_DIR, slug, "index.html");
    try {
      statSync(indexPath);
    } catch {
      continue; // no index.html in this folder — skip
    }
    const html = readFileSync(indexPath, "utf8");
    const meta = getMetadata(slug, html);
    const lastModified = getLastModified(slug, meta.dateMeta);
    experiments.push({ slug, ...meta, lastModified });
  }
  experiments.sort((a, b) => b.lastModified.localeCompare(a.lastModified));
  return experiments;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function renderCard(exp) {
  const tags = exp.tags
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join("");
  return `
    <a class="card" href="experiments/${encodeURIComponent(exp.slug)}/index.html">
      <h2>${escapeHtml(exp.title)}</h2>
      ${exp.description ? `<p>${escapeHtml(exp.description)}</p>` : ""}
      <div class="meta">
        <time>${escapeHtml(exp.lastModified)}</time>
        ${tags}
      </div>
    </a>`;
}

function renderIndex(experiments) {
  const cards = experiments.length
    ? experiments.map(renderCard).join("\n")
    : `<p class="empty">Inga experiment ännu. Lägg till en mapp i <code>experiments/</code>.</p>`;
  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>web-experiments</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #ffffff; --fg: #1a1a1a; --muted: #666; --border: #e2e2e2; --card-bg: #fafafa;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #14151a; --fg: #f0f0f0; --muted: #9a9a9a; --border: #2a2b31; --card-bg: #1c1d23; }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 2.5rem 1.5rem 4rem; background: var(--bg); color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  header { max-width: 960px; margin: 0 auto 2.5rem; }
  header h1 { font-size: 1.6rem; margin: 0 0 0.4rem; }
  header p { color: var(--muted); margin: 0; }
  .grid {
    max-width: 960px; margin: 0 auto; display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem;
  }
  .card {
    display: block; padding: 1.25rem; border: 1px solid var(--border); border-radius: 10px;
    background: var(--card-bg); text-decoration: none; color: inherit; transition: transform 0.1s ease;
  }
  .card:hover { transform: translateY(-2px); border-color: var(--muted); }
  .card h2 { font-size: 1.05rem; margin: 0 0 0.4rem; }
  .card p { font-size: 0.9rem; color: var(--muted); margin: 0 0 0.75rem; }
  .meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; font-size: 0.78rem; color: var(--muted); }
  .tag { padding: 0.15rem 0.5rem; border-radius: 999px; background: var(--border); }
  .empty { max-width: 960px; margin: 0 auto; color: var(--muted); }
  footer { max-width: 960px; margin: 3rem auto 0; color: var(--muted); font-size: 0.8rem; }
  footer a { color: inherit; }
</style>
</head>
<body>
  <header>
    <h1>web-experiments</h1>
    <p>Publika HTML-prototyper, en mapp per experiment.</p>
  </header>
  <main class="grid">${cards}
  </main>
  <footer>
    <p><a href="https://github.com/joelnandorf/web-experiments">Källkod på GitHub</a></p>
  </footer>
</body>
</html>
`;
}

function build() {
  rmSync(DIST_DIR, { recursive: true, force: true });
  mkdirSync(DIST_DIR, { recursive: true });

  const experiments = discoverExperiments();

  for (const exp of experiments) {
    const src = join(EXPERIMENTS_DIR, exp.slug);
    const dest = join(DIST_DIR, "experiments", exp.slug);
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
  }

  writeFileSync(join(DIST_DIR, "index.html"), renderIndex(experiments));
  writeFileSync(join(DIST_DIR, ".nojekyll"), "");

  console.log(`Byggde ${experiments.length} experiment till dist/`);
  for (const exp of experiments) console.log(`  - ${exp.slug}: "${exp.title}"`);
}

build();
