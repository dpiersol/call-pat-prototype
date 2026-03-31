import { eq } from "drizzle-orm";
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
const db = drizzle(sqlite, { schema });

const DEMO_USERS = [
  {
    id: "a0000001-0000-4000-8000-000000000001",
    displayName: "Jamie Reporter",
    email: "reporter@demo.local",
    role: "employee" as const,
  },
  {
    id: "a0000002-0000-4000-8000-000000000002",
    displayName: "Dana Dispatcher",
    email: "dispatcher@demo.local",
    role: "dispatcher" as const,
  },
  {
    id: "a0000003-0000-4000-8000-000000000003",
    displayName: "Alex Admin",
    email: "admin@demo.local",
    role: "admin" as const,
  },
];

async function seed() {
  for (const u of DEMO_USERS) {
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, u.id))
      .get();
    if (!existing) {
      await db.insert(schema.users).values({
        id: u.id,
        displayName: u.displayName,
        email: u.email,
        role: u.role,
      });
      console.log("Seeded user:", u.email);
    } else {
      await db
        .update(schema.users)
        .set({
          displayName: u.displayName,
          email: u.email,
          role: u.role,
        })
        .where(eq(schema.users.id, u.id));
      console.log("Updated user:", u.email);
    }
  }
  sqlite.close();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
