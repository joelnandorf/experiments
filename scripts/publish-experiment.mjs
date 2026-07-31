#!/usr/bin/env node
// Bygger, validerar, committar och pushar ett experiment i ett steg.
// Användning: node scripts/publish-experiment.mjs <slug> ["commit-meddelande"]
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const slug = process.argv[2];
const customMessage = process.argv.slice(3).join(" ");

if (!slug) {
  console.error('Användning: node scripts/publish-experiment.mjs <slug> ["commit-meddelande"]');
  process.exit(1);
}

const appDir = join("app", "(experiments)", slug);
const legacyDir = join("public", slug);

let targetDir;
if (existsSync(join(ROOT, appDir, "page.tsx"))) {
  targetDir = appDir;
} else if (existsSync(join(ROOT, legacyDir))) {
  targetDir = legacyDir;
} else {
  console.error(
    `Hittar ingen app/(experiments)/${slug}/page.tsx eller public/${slug}/ — skapa experimentet först ` +
      `(kopiera templates/basic/page.tsx + meta.ts till app/(experiments)/${slug}/).`,
  );
  process.exit(1);
}

function run(cmd) {
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}
function runCapture(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" });
}

console.log(`\n→ Bygger och validerar hela sajten (inkl. ${targetDir}) ...`);
run("npm run build");

console.log(`\n→ Stagear ${targetDir} ...`);
run(`git add ${JSON.stringify(targetDir)}`);

const staged = runCapture(`git diff --cached --name-only -- ${JSON.stringify(targetDir)}`).trim();
if (!staged) {
  console.log("Inga ändringar att committa (experimentet matchar redan senaste commit).");
} else {
  const message = customMessage || `Publish experiment: ${slug}`;
  console.log(`\n→ Committar: "${message}"`);
  run(`git commit -m ${JSON.stringify(message)}`);
}

console.log("\n→ Pushar till origin/main ...");
try {
  run("git push origin HEAD:main");
} catch {
  console.error(
    "\nPush avvisades — main har troligen nya commits du saknar lokalt.\n" +
      "Kör `git fetch origin main && git rebase origin/main` och försök igen.\n" +
      "Force-pusha aldrig över main för att tvinga igenom detta.",
  );
  process.exit(1);
}

console.log(
  `\n✅ Publicerat! Live inom en minut eller två på:\n` +
    `   https://experiments.nandorf.dev/${slug}/\n` +
    `   (översikt: https://experiments.nandorf.dev/)`,
);
