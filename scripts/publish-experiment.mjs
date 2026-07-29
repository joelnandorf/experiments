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
  console.error("Användning: node scripts/publish-experiment.mjs <slug> [\"commit-meddelande\"]");
  process.exit(1);
}

const expDir = join("experiments", slug);
const indexPath = join(ROOT, expDir, "index.html");
if (!existsSync(indexPath)) {
  console.error(`Hittar ingen experiments/${slug}/index.html — skapa filen först.`);
  process.exit(1);
}

function run(cmd) {
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}
function runCapture(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" });
}

console.log(`\n→ Bygger och validerar experiments/${slug} ...`);
run("node scripts/build-site.mjs");

console.log(`\n→ Stagear ${expDir} ...`);
run(`git add ${JSON.stringify(expDir)}`);

const staged = runCapture(`git diff --cached --name-only -- ${JSON.stringify(expDir)}`).trim();
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
    `   https://experiments.nandorf.dev/experiments/${slug}/\n` +
    `   (översikt: https://experiments.nandorf.dev/)`,
);
