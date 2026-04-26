#!/usr/bin/env node
/**
 * Post-build: append CHANGELOG.md with canonical repo + version, then bump
 * the second segment (milestone iteration). Invoked from root `package.json` build.
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
  const raw = readFileSync(pkgPath, "utf8");
  return JSON.parse(raw);
}

function parseSemver(v) {
  const m = String(v).replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) throw new Error(`Invalid semver: ${v}`);
  return { major: +m[1], middle: +m[2], third: +m[3] };
}

function formatSemver(p) {
  return `${p.major}.${p.middle}.${p.third}`;
}

function bumpBuildIteration(p) {
  return { major: p.major, middle: p.middle + 1, third: 0 };
}

function appendChangelog(version, note) {
  const date = new Date().toISOString().slice(0, 10);
  const block = `
## v${version} — ${date}

- **Repository:** ${REPO_URL}
- **Build:** full workspace \`npm run build\` completed successfully.
${note ? `- **Note:** ${note}\n` : ""}`;
  let existing = "";
  try {
    existing = readFileSync(changelogPath, "utf8");
  } catch {
    existing = "";
  }
  if (existing.includes(`## v${version} —`)) {
    return false;
  }
  const header = existing.trimStart().startsWith("#")
    ? ""
    : `# Changelog\n\nAll notable production builds are logged here with repo URL.\n\n`;
  const body = existing.trimStart().startsWith("#") ? existing : `${header}${existing}`;
  writeFileSync(changelogPath, `${body.trimEnd()}\n${block.trim()}\n`);
  return true;
}

const pkg = readPkg();
const before = parseSemver(pkg.version);
const after = bumpBuildIteration(before);
const newVersion = formatSemver(after);

const appended = appendChangelog(newVersion, process.env.BUILD_NOTE?.trim() || "");
if (appended) {
  pkg.version = newVersion;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`record-build: CHANGELOG v${newVersion}; package.json -> ${newVersion}`);
} else {
  console.log(`record-build: CHANGELOG already has v${newVersion}, skipped bump`);
}
