/**
 * Minimal API smoke check (no test framework — avoids workspace dedupe issues with vitest + Expo).
 * Run: npx tsx src/smoke.ts
 */
import assert from "node:assert";
import { app } from "./app.js";

async function main() {
  const res = await app.request("http://localhost/health");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { ok: true });
  console.log("smoke: GET /health ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
