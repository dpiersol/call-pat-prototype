#!/usr/bin/env node
/**
 * Bump the third semver segment (unit-test iteration counter) and append CHANGELOG.
 * Run manually when you finish a deliberate test iteration (e.g. new suite / fix wave).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pkgPath = join(root, "package.json");
const changelogPath = join(root, "CHANGELOG.md");

const REPO_URL =
  process.env.PROJECT_REPO_URL ?? "https://github.com/dpiersol/call-pat-prototype";

function readPkg() {
  return JSON.parse(readFileSync(pkgPath, "utf8"));
}

function parseSemver(v) {
  const m = String(v).replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) throw new Error(`Invalid semver: ${v}`);
  return { major: +m[1], middle: +m[2], third: +m[3] };
}

function formatSemver(p) {
  return `${p.major}.${p.middle}.${p.third}`;
}

function bumpTestIteration(p) {
  return { major: p.major, middle: p.middle, third: p.third + 1 };
}

const pkg = readPkg();
const before = parseSemver(pkg.version);
const after = bumpTestIteration(before);
const newVersion = formatSemver(after);
const date = new Date().toISOString().slice(0, 10);
const note = process.env.TEST_ITERATION_NOTE?.trim() || "Unit test iteration recorded.";

const block = `
## v${newVersion} — ${date} (test iteration)

- **Repository:** ${REPO_URL}
- **Tests:** ${note}
`;

let existing = "";
try {
  existing = readFileSync(changelogPath, "utf8");
} catch {
  existing = `# Changelog\n\n`;
}
if (existing.includes(`## v${newVersion} —`)) {
  console.log(`record-test-iteration: CHANGELOG already has v${newVersion}, skipped`);
  process.exit(0);
}

writeFileSync(changelogPath, existing.trimEnd() + block + "\n");
pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`record-test-iteration: -> v${newVersion}`);
