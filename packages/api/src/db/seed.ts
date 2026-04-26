import { eq } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
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

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const REPORTER_ID = "a0000001-0000-4000-8000-000000000001";
const DISPATCHER_ID = "a0000002-0000-4000-8000-000000000002";
const ADMIN_ID = "a0000003-0000-4000-8000-000000000003";

const DEMO_USERS = [
  { id: REPORTER_ID, displayName: "Jamie Reporter", email: "reporter@demo.local", role: "employee" as const },
  { id: DISPATCHER_ID, displayName: "Dana Dispatcher", email: "dispatcher@demo.local", role: "dispatcher" as const },
  { id: ADMIN_ID, displayName: "Alex Admin", email: "admin@demo.local", role: "admin" as const },
];

type ReportStatus = "submitted" | "triaged" | "in_progress" | "resolved" | "closed";

interface SeedReport {
  title: string;
  description: string;
  category: string;
  lat: number;
  lng: number;
  addressText: string;
  status: ReportStatus;
  daysAgo: number;
}

const ABQ_REPORTS: SeedReport[] = [
  {
    title: "Giant pothole on Central Ave",
    description: "Two-foot-wide pothole eastbound on Central near Nob Hill. Nearly swallowed my tire. Needs urgent fill before someone loses a rim.",
    category: "Pothole", lat: 35.0786, lng: -106.6198,
    addressText: "Central Ave & Carlisle Blvd NE", status: "submitted", daysAgo: 1,
  },
  {
    title: "Graffiti on I-40 overpass",
    description: "Large spray paint tags on the concrete barrier of the I-40 overpass at Louisiana Blvd. Visible from both directions.",
    category: "Graffiti", lat: 35.0808, lng: -106.5727,
    addressText: "I-40 & Louisiana Blvd overpass", status: "triaged", daysAgo: 3,
  },
  {
    title: "Needles at Roosevelt Park",
    description: "Found a cluster of used syringes near the southeast playground area. Please send a cleanup crew ASAP — kids play here.",
    category: "Needles", lat: 35.0823, lng: -106.6561,
    addressText: "Roosevelt Park, Coal Ave SE", status: "in_progress", daysAgo: 2,
  },
  {
    title: "Broken streetlight on Rio Grande Blvd",
    description: "Streetlight has been out for two weeks near the Bosque trailhead. Very dark at night, safety hazard for walkers.",
    category: "Other", lat: 35.0941, lng: -106.6733,
    addressText: "Rio Grande Blvd NW near Alameda", status: "submitted", daysAgo: 5,
  },
  {
    title: "Pothole cluster at San Mateo & Menaul",
    description: "Three potholes right at the intersection. Traffic is swerving to avoid them. Road surface crumbling.",
    category: "Pothole", lat: 35.1037, lng: -106.5854,
    addressText: "San Mateo Blvd & Menaul Blvd NE", status: "triaged", daysAgo: 4,
  },
  {
    title: "Graffiti under the Rail Runner bridge",
    description: "Fresh tags under the bridge near the Downtown Alvarado station. Covers about 30 feet of wall.",
    category: "Graffiti", lat: 35.0849, lng: -106.6493,
    addressText: "Rail Runner bridge, 1st St & Silver Ave", status: "resolved", daysAgo: 7,
  },
  {
    title: "Abandoned shopping cart blocking sidewalk",
    description: "Shopping cart left on the sidewalk on Lead Ave near UNM. Wheelchair users have to go into traffic.",
    category: "Other", lat: 35.0820, lng: -106.6312,
    addressText: "Lead Ave SE near Yale Blvd", status: "submitted", daysAgo: 1,
  },
  {
    title: "Pothole on Tramway Blvd",
    description: "Deep pothole on northbound Tramway near the foothills trailhead parking entrance. Growing fast after the rain.",
    category: "Pothole", lat: 35.1489, lng: -106.4875,
    addressText: "Tramway Blvd NE near Elena Gallegos", status: "submitted", daysAgo: 0,
  },
  {
    title: "Needles behind the library",
    description: "Used needles found in the alley behind the Ernie Pyle branch library. At least a dozen. Gloves recommended for pickup.",
    category: "Needles", lat: 35.0771, lng: -106.6168,
    addressText: "Ernie Pyle Library, 900 Girard SE", status: "triaged", daysAgo: 6,
  },
  {
    title: "Graffiti on Old Town gazebo",
    description: "Someone tagged the historic gazebo in Old Town plaza overnight. Really disrespectful to the landmark.",
    category: "Graffiti", lat: 35.0961, lng: -106.6697,
    addressText: "Old Town Plaza", status: "in_progress", daysAgo: 3,
  },
  {
    title: "Sinkhole forming on 2nd Street",
    description: "Asphalt caving in around a storm drain on 2nd Street southbound. About 18 inches across. Looks like it could get worse.",
    category: "Pothole", lat: 35.0773, lng: -106.6485,
    addressText: "2nd St SW near Bridge Blvd", status: "submitted", daysAgo: 2,
  },
  {
    title: "Illegal dumping at Bosque trail",
    description: "Mattress, tires, and trash bags dumped at the Bosque trail entrance off Montaño. Attracting rodents.",
    category: "Other", lat: 35.1236, lng: -106.6701,
    addressText: "Bosque trail at Montaño Rd NW", status: "triaged", daysAgo: 8,
  },
  {
    title: "Crosswalk paint faded on Lomas",
    description: "Crosswalk markings at Lomas & Broadway are barely visible. Pedestrians are invisible to drivers at this busy intersection.",
    category: "Other", lat: 35.0912, lng: -106.6472,
    addressText: "Lomas Blvd & Broadway Blvd NE", status: "closed", daysAgo: 14,
  },
  {
    title: "Pothole on Coors Blvd near Paseo",
    description: "Massive pothole southbound on Coors just past the Paseo del Norte exit. Multiple cars hitting it.",
    category: "Pothole", lat: 35.1591, lng: -106.6815,
    addressText: "Coors Blvd & Paseo del Norte NW", status: "in_progress", daysAgo: 5,
  },
  {
    title: "Needles near ART bus stop",
    description: "Needles scattered around the ART stop bench at Central & San Mateo. Passengers are concerned.",
    category: "Needles", lat: 35.0794, lng: -106.5858,
    addressText: "Central Ave & San Mateo ART stop", status: "submitted", daysAgo: 0,
  },
];

function makePlaceholderJpeg(label: string): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <rect width="640" height="480" fill="#e8ded0"/>
    <text x="320" y="220" font-size="28" text-anchor="middle" fill="#6b5b4d" font-family="sans-serif">${escXml(label)}</text>
    <text x="320" y="260" font-size="16" text-anchor="middle" fill="#9a8a7c" font-family="sans-serif">Call Pat — ABQ demo image</text>
  </svg>`;
  return Buffer.from(svg, "utf-8");
}

function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function daysAgoDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

const STATUS_CHAIN: Record<ReportStatus, ReportStatus[]> = {
  submitted: ["submitted"],
  triaged: ["submitted", "triaged"],
  in_progress: ["submitted", "triaged", "in_progress"],
  resolved: ["submitted", "triaged", "in_progress", "resolved"],
  closed: ["submitted", "triaged", "in_progress", "resolved", "closed"],
};

async function seed() {
  for (const u of DEMO_USERS) {
    const existing = await db.select().from(schema.users).where(eq(schema.users.id, u.id)).get();
    if (!existing) {
      await db.insert(schema.users).values(u);
      console.log("Seeded user:", u.email);
    } else {
      await db.update(schema.users).set({ displayName: u.displayName, email: u.email, role: u.role }).where(eq(schema.users.id, u.id));
      console.log("Updated user:", u.email);
    }
  }

  const reporterLedger = await db
    .select()
    .from(schema.pointsLedger)
    .where(eq(schema.pointsLedger.userId, REPORTER_ID))
    .all();
  if (reporterLedger.length === 0) {
    await db.insert(schema.pointsLedger).values({
      id: randomUUID(),
      userId: REPORTER_ID,
      delta: 5,
      reason: "welcome_bonus",
      refType: null,
      refId: null,
      createdAt: new Date(),
    });
    console.log("Seeded welcome bonus points for demo reporter.");
  }

  const existingReports = await db.select({ id: schema.reports.id }).from(schema.reports).all();
  if (existingReports.length > 0) {
    console.log(`Skipping report seed (${existingReports.length} reports already exist). Delete data/callpat.db to re-seed.`);
    sqlite.close();
    return;
  }

  let woCount = 0;
  for (const r of ABQ_REPORTS) {
    const reportId = randomUUID();
    const createdAt = daysAgoDate(r.daysAgo);
    const updatedAt = new Date(createdAt.getTime() + 3600_000);

    let workOrderId: string | null = null;
    if (["in_progress", "resolved", "closed"].includes(r.status)) {
      const woId = randomUUID();
      workOrderId = woId;
      const woCreated = new Date(createdAt.getTime() + 7200_000);
      await db.insert(schema.workOrders).values({
        id: woId,
        title: `WO: ${r.title}`,
        priority: r.status === "in_progress" ? "high" : "normal",
        owningOrg: r.category === "Pothole" ? "Streets" : r.category === "Graffiti" ? "Solid Waste" : r.category === "Needles" ? "Environmental Health" : "General Services",
        assignee: r.status === "resolved" || r.status === "closed" ? "Field Crew Delta" : null,
        status: r.status === "in_progress" ? "in_progress" : r.status === "resolved" ? "resolved" : "closed",
        createdFromReportId: reportId,
        createdAt: woCreated,
        updatedAt: new Date(woCreated.getTime() + 3600_000),
      });
      woCount++;
    }

    await db.insert(schema.reports).values({
      id: reportId,
      reporterUserId: REPORTER_ID,
      title: r.title,
      description: r.description,
      category: r.category,
      lat: r.lat,
      lng: r.lng,
      addressText: r.addressText,
      locationSource: "manual",
      status: r.status,
      workOrderId,
      createdAt,
      updatedAt,
    });

    const attId = randomUUID();
    const storageKey = `${reportId}.svg`;
    const imgBuf = makePlaceholderJpeg(r.title.slice(0, 40));
    fs.writeFileSync(path.join(UPLOAD_DIR, storageKey), imgBuf);
    await db.insert(schema.attachments).values({
      id: attId,
      reportId,
      storageKey,
      mime: "image/svg+xml",
      createdAt,
    });

    const chain = STATUS_CHAIN[r.status];
    let prevStatus: string | null = null;
    for (let i = 0; i < chain.length; i++) {
      const evTime = new Date(createdAt.getTime() + i * 3600_000);
      await db.insert(schema.statusEvents).values({
        id: randomUUID(),
        targetType: "report",
        targetId: reportId,
        fromStatus: prevStatus,
        toStatus: chain[i],
        actorUserId: i === 0 ? REPORTER_ID : DISPATCHER_ID,
        note: i === 0 ? null : `Status advanced to ${chain[i]}`,
        createdAt: evTime,
      });
      prevStatus = chain[i];
    }

    await db.insert(schema.pointsLedger).values({
      id: randomUUID(),
      userId: REPORTER_ID,
      delta: 10,
      reason: "report_submitted",
      refType: "report",
      refId: reportId,
      createdAt,
    });
  }

  console.log(`Seeded ${ABQ_REPORTS.length} reports and ${woCount} work orders with attachments and timelines.`);
  sqlite.close();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
