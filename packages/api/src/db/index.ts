import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveDbPath(): string {
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv?.startsWith("file:")) {
    const p = fromEnv.slice("file:".length);
    return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
  }
  return path.resolve(process.cwd(), "data", "callpat.db");
}

const dbPath = resolveDbPath();
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { schema };
