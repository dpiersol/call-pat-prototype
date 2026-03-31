import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  createReportBodySchema,
  createWorkOrderBodySchema,
  demoLoginRequestSchema,
  listReportsQuerySchema,
  patchReportBodySchema,
  patchWorkOrderBodySchema,
  type ReportStatus,
  type WorkOrderStatus,
} from "@call-pat/shared";
import { authMiddleware, getBearerToken, requireRole, signToken, verifyToken } from "./auth.js";
import { db, schema } from "./db/index.js";
import { toReport, toWorkOrder } from "./lib/mappers.js";
import { canTransitionReport, canTransitionWorkOrder } from "./workflows/status.js";

const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), "uploads");
const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type"],
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.post("/auth/demo-login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = demoLoginRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const { email } = parsed.data;
  const row = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get();
  if (!row) {
    return c.json({ error: "Unknown demo user" }, 404);
  }
  const token = await signToken({
    id: row.id,
    role: row.role as "employee" | "dispatcher" | "admin",
    displayName: row.displayName,
  });
  return c.json({
    token,
    user: {
      id: row.id,
      displayName: row.displayName,
      role: row.role,
    },
  });
});

const authed = new Hono();
authed.use("/*", authMiddleware);

authed.get("/me", (c) => {
  const u = c.get("user");
  return c.json({
    id: u.sub,
    displayName: u.displayName,
    role: u.role,
  });
});

authed.get("/reports/mine", async (c) => {
  const u = c.get("user");
  const rows = await db
    .select()
    .from(schema.reports)
    .where(eq(schema.reports.reporterUserId, u.sub))
    .orderBy(desc(schema.reports.createdAt));
  const out = await Promise.all(rows.map((r) => hydrateReport(r.id)));
  return c.json({ reports: out.filter(Boolean) });
});

authed.get("/reports/:id", async (c) => {
  const u = c.get("user");
  const id = c.req.param("id");
  const row = await db
    .select()
    .from(schema.reports)
    .where(eq(schema.reports.id, id))
    .get();
  if (!row) return c.json({ error: "Not found" }, 404);
  if (
    row.reporterUserId !== u.sub &&
    u.role !== "dispatcher" &&
    u.role !== "admin"
  ) {
    return c.json({ error: "Forbidden" }, 403);
  }
  const report = await hydrateReport(id);
  return c.json(report);
});

authed.post("/reports", async (c) => {
  const u = c.get("user");
  if (u.role !== "employee") {
    return c.json({ error: "Only employees submit reports" }, 403);
  }
  const body = await c.req.parseBody({ all: true });
  const raw: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (k === "photo" || k === "photos") continue;
    raw[k] = v;
  }
  const parsed = createReportBodySchema.safeParse({
    ...raw,
    lat: raw.lat === "" || raw.lat == null ? null : raw.lat,
    lng: raw.lng === "" || raw.lng == null ? null : raw.lng,
  });
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;
  const file = body["photo"] as File | undefined;
  if (!file || !(file instanceof File)) {
    return c.json({ error: "photo file required" }, 400);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return c.json({ error: "file too large" }, 400);
  }
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIME.has(mime)) {
    return c.json({ error: "unsupported image type" }, 400);
  }
  const reportId = randomUUID();
  const now = new Date();
  const ext =
    mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : ".jpg";
  const storageKey = `${reportId}${ext}`;
  const diskPath = path.join(UPLOAD_DIR, storageKey);
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(diskPath, buf);

  await db.insert(schema.reports).values({
    id: reportId,
    reporterUserId: u.sub,
    title: data.title,
    description: data.description,
    category: data.category,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    addressText: data.addressText ?? null,
    locationSource: data.locationSource,
    status: "submitted",
    workOrderId: null,
    createdAt: now,
    updatedAt: now,
  });

  const attId = randomUUID();
  await db.insert(schema.attachments).values({
    id: attId,
    reportId,
    storageKey,
    mime,
    createdAt: now,
  });

  const evId = randomUUID();
  await db.insert(schema.statusEvents).values({
    id: evId,
    targetType: "report",
    targetId: reportId,
    fromStatus: null,
    toStatus: "submitted",
    actorUserId: u.sub,
    note: null,
    createdAt: now,
  });

  const report = await hydrateReport(reportId);
  return c.json(report, 201);
});

authed.patch("/reports/:id", async (c) => {
  const u = c.get("user");
  const id = c.req.param("id");
  const row = await db
    .select()
    .from(schema.reports)
    .where(eq(schema.reports.id, id))
    .get();
  if (!row) return c.json({ error: "Not found" }, 404);
  if (row.reporterUserId !== u.sub || u.role !== "employee") {
    return c.json({ error: "Only the reporter can edit (employee role)" }, 403);
  }
  const elapsed = Date.now() - row.createdAt.getTime();
  if (elapsed > EDIT_WINDOW_MS) {
    return c.json({ error: "Edit window expired (24h)" }, 403);
  }
  const body = await c.req.json();
  const parsed = patchReportBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const patch = parsed.data;
  const now = new Date();
  const updates: Partial<typeof schema.reports.$inferInsert> = {
    updatedAt: now,
  };
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.description !== undefined) updates.description = patch.description;
  if (patch.category !== undefined) updates.category = patch.category;
  if (patch.lat !== undefined) updates.lat = patch.lat;
  if (patch.lng !== undefined) updates.lng = patch.lng;
  if (patch.addressText !== undefined) updates.addressText = patch.addressText;
  if (patch.locationSource !== undefined) {
    updates.locationSource = patch.locationSource;
  }
  await db.update(schema.reports).set(updates).where(eq(schema.reports.id, id));

  const evId = randomUUID();
  await db.insert(schema.statusEvents).values({
    id: evId,
    targetType: "report",
    targetId: id,
    fromStatus: row.status,
    toStatus: row.status,
    actorUserId: u.sub,
    note: "reporter_updated_details",
    createdAt: now,
  });

  const report = await hydrateReport(id);
  return c.json(report);
});

const staff = new Hono();
staff.use("/*", authMiddleware);
staff.use("/*", requireRole("dispatcher", "admin"));

staff.get("/reports", async (c) => {
  const q = listReportsQuerySchema.safeParse({
    status: c.req.query("status") || undefined,
    from: c.req.query("from") || undefined,
    to: c.req.query("to") || undefined,
  });
  if (!q.success) {
    return c.json({ error: q.error.flatten() }, 400);
  }
  const { status, from, to } = q.data;
  const conditions = [];
  if (status) conditions.push(eq(schema.reports.status, status));
  if (from) {
    conditions.push(gte(schema.reports.createdAt, new Date(from)));
  }
  if (to) {
    conditions.push(lte(schema.reports.createdAt, new Date(to)));
  }
  const rows = await db
    .select()
    .from(schema.reports)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.reports.createdAt));
  const out = await Promise.all(rows.map((r) => hydrateReport(r.id)));
  return c.json({ reports: out.filter(Boolean) });
});

staff.post("/work-orders", async (c) => {
  const u = c.get("user");
  const body = await c.req.json();
  const parsed = createWorkOrderBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;
  const id = randomUUID();
  const now = new Date();
  await db.insert(schema.workOrders).values({
    id,
    title: data.title,
    priority: data.priority,
    owningOrg: data.owningOrg,
    assignee: data.assignee ?? null,
    status: "new",
    createdFromReportId: data.createdFromReportId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.statusEvents).values({
    id: randomUUID(),
    targetType: "work_order",
    targetId: id,
    fromStatus: null,
    toStatus: "new",
    actorUserId: u.sub,
    note: null,
    createdAt: now,
  });

  if (data.createdFromReportId) {
    const rep = await db
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.id, data.createdFromReportId))
      .get();
    if (rep) {
      await db
        .update(schema.reports)
        .set({
          workOrderId: id,
          status: rep.status === "submitted" ? "triaged" : rep.status,
          updatedAt: now,
        })
        .where(eq(schema.reports.id, rep.id));
      if (rep.status === "submitted") {
        await db.insert(schema.statusEvents).values({
          id: randomUUID(),
          targetType: "report",
          targetId: rep.id,
          fromStatus: "submitted",
          toStatus: "triaged",
          actorUserId: u.sub,
          note: "linked_to_work_order",
          createdAt: now,
        });
      }
    }
  }

  const wo = await hydrateWorkOrder(id);
  return c.json(wo, 201);
});

staff.get("/work-orders", async (c) => {
  const rows = await db
    .select()
    .from(schema.workOrders)
    .orderBy(desc(schema.workOrders.createdAt));
  const out = await Promise.all(rows.map((r) => hydrateWorkOrder(r.id)));
  return c.json({ workOrders: out.filter(Boolean) });
});

staff.get("/work-orders/:id", async (c) => {
  const id = c.req.param("id");
  const wo = await hydrateWorkOrder(id);
  if (!wo) return c.json({ error: "Not found" }, 404);
  return c.json(wo);
});

staff.patch("/work-orders/:id", async (c) => {
  const u = c.get("user");
  const id = c.req.param("id");
  const row = await db
    .select()
    .from(schema.workOrders)
    .where(eq(schema.workOrders.id, id))
    .get();
  if (!row) return c.json({ error: "Not found" }, 404);
  const body = await c.req.json();
  const parsed = patchWorkOrderBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const patch = parsed.data;
  const now = new Date();

  if (patch.status && patch.status !== row.status) {
    const ok = canTransitionWorkOrder(
      row.status as WorkOrderStatus,
      patch.status,
    );
    if (!ok) {
      return c.json({ error: "Invalid status transition" }, 400);
    }
    await db.insert(schema.statusEvents).values({
      id: randomUUID(),
      targetType: "work_order",
      targetId: id,
      fromStatus: row.status,
      toStatus: patch.status,
      actorUserId: u.sub,
      note: patch.note ?? null,
      createdAt: now,
    });
  }

  const woUpdates: Partial<typeof schema.workOrders.$inferInsert> = {
    updatedAt: now,
  };
  if (patch.title !== undefined) woUpdates.title = patch.title;
  if (patch.priority !== undefined) woUpdates.priority = patch.priority;
  if (patch.owningOrg !== undefined) woUpdates.owningOrg = patch.owningOrg;
  if (patch.assignee !== undefined) woUpdates.assignee = patch.assignee;
  if (patch.status !== undefined) woUpdates.status = patch.status;
  await db
    .update(schema.workOrders)
    .set(woUpdates)
    .where(eq(schema.workOrders.id, id));

  const linkedReport =
    row.createdFromReportId &&
    (await db
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.id, row.createdFromReportId))
      .get());

  if (linkedReport && patch.status) {
    const mapToReport: Partial<Record<WorkOrderStatus, ReportStatus | null>> =
      {
        new: "triaged",
        triaged: "triaged",
        assigned: "in_progress",
        in_progress: "in_progress",
        resolved: "resolved",
        closed: "closed",
      };
    const nextRep = mapToReport[patch.status];
    if (nextRep && linkedReport.status !== nextRep) {
      if (
        canTransitionReport(
          linkedReport.status as ReportStatus,
          nextRep,
        )
      ) {
        await db
          .update(schema.reports)
          .set({ status: nextRep, updatedAt: now })
          .where(eq(schema.reports.id, linkedReport.id));
        await db.insert(schema.statusEvents).values({
          id: randomUUID(),
          targetType: "report",
          targetId: linkedReport.id,
          fromStatus: linkedReport.status,
          toStatus: nextRep,
          actorUserId: u.sub,
          note: "synced_from_work_order",
          createdAt: now,
        });
      }
    }
  }

  const wo = await hydrateWorkOrder(id);
  return c.json(wo);
});

staff.post("/reports/:id/link-work-order", async (c) => {
  const u = c.get("user");
  const reportId = c.req.param("id");
  const body = await c.req.json();
  const workOrderId = body?.workOrderId as string | undefined;
  if (!workOrderId || typeof workOrderId !== "string") {
    return c.json({ error: "workOrderId required" }, 400);
  }
  const rep = await db
    .select()
    .from(schema.reports)
    .where(eq(schema.reports.id, reportId))
    .get();
  if (!rep) return c.json({ error: "Report not found" }, 404);
  const wo = await db
    .select()
    .from(schema.workOrders)
    .where(eq(schema.workOrders.id, workOrderId))
    .get();
  if (!wo) return c.json({ error: "Work order not found" }, 404);
  const now = new Date();
  await db
    .update(schema.reports)
    .set({
      workOrderId,
      status: rep.status === "submitted" ? "triaged" : rep.status,
      updatedAt: now,
    })
    .where(eq(schema.reports.id, reportId));
  if (rep.status === "submitted") {
    await db.insert(schema.statusEvents).values({
      id: randomUUID(),
      targetType: "report",
      targetId: reportId,
      fromStatus: "submitted",
      toStatus: "triaged",
      actorUserId: u.sub,
      note: "linked_to_work_order",
      createdAt: now,
    });
  }
  await db
    .update(schema.workOrders)
    .set({
      createdFromReportId: reportId,
      updatedAt: now,
    })
    .where(eq(schema.workOrders.id, workOrderId));

  const report = await hydrateReport(reportId);
  return c.json(report);
});

staff.patch("/reports/:id/status", async (c) => {
  const u = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const toStatus = body?.status as ReportStatus | undefined;
  const note = (body?.note as string | null | undefined) ?? null;
  if (!toStatus) {
    return c.json({ error: "status required" }, 400);
  }
  const row = await db
    .select()
    .from(schema.reports)
    .where(eq(schema.reports.id, id))
    .get();
  if (!row) return c.json({ error: "Not found" }, 404);
  if (!canTransitionReport(row.status as ReportStatus, toStatus)) {
    return c.json({ error: "Invalid status transition" }, 400);
  }
  const now = new Date();
  await db.insert(schema.statusEvents).values({
    id: randomUUID(),
    targetType: "report",
    targetId: id,
    fromStatus: row.status,
    toStatus,
    actorUserId: u.sub,
    note,
    createdAt: now,
  });
  await db
    .update(schema.reports)
    .set({ status: toStatus, updatedAt: now })
    .where(eq(schema.reports.id, id));
  const report = await hydrateReport(id);
  return c.json(report);
});

app.route("/", authed);
app.route("/admin", staff);

app.get("/attachments/:id/file", async (c) => {
  const token = getBearerToken(c);
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const user = await verifyToken(token);
  if (!user) {
    return c.json({ error: "Invalid token" }, 401);
  }
  const id = c.req.param("id");
  const att = await db
    .select()
    .from(schema.attachments)
    .where(eq(schema.attachments.id, id))
    .get();
  if (!att) return c.json({ error: "Not found" }, 404);
  const report = await db
    .select()
    .from(schema.reports)
    .where(eq(schema.reports.id, att.reportId))
    .get();
  if (!report) return c.json({ error: "Not found" }, 404);
  if (
    report.reporterUserId !== user.sub &&
    user.role !== "dispatcher" &&
    user.role !== "admin"
  ) {
    return c.json({ error: "Forbidden" }, 403);
  }
  const diskPath = path.join(UPLOAD_DIR, att.storageKey);
  if (!fs.existsSync(diskPath)) {
    return c.json({ error: "File missing" }, 404);
  }
  const buf = fs.readFileSync(diskPath);
  return new Response(buf, {
    headers: {
      "Content-Type": att.mime,
      "Cache-Control": "private, max-age=3600",
    },
  });
});

async function hydrateReport(id: string) {
  const row = await db
    .select()
    .from(schema.reports)
    .where(eq(schema.reports.id, id))
    .get();
  if (!row) return null;
  const atts = await db
    .select()
    .from(schema.attachments)
    .where(eq(schema.attachments.reportId, id));
  const evs = await db
    .select()
    .from(schema.statusEvents)
    .where(
      and(
        eq(schema.statusEvents.targetType, "report"),
        eq(schema.statusEvents.targetId, id),
      ),
    )
    .orderBy(asc(schema.statusEvents.createdAt));
  return toReport(row, atts, evs);
}

async function hydrateWorkOrder(id: string) {
  const row = await db
    .select()
    .from(schema.workOrders)
    .where(eq(schema.workOrders.id, id))
    .get();
  if (!row) return null;
  const evs = await db
    .select()
    .from(schema.statusEvents)
    .where(
      and(
        eq(schema.statusEvents.targetType, "work_order"),
        eq(schema.statusEvents.targetId, id),
      ),
    )
    .orderBy(asc(schema.statusEvents.createdAt));
  return toWorkOrder(row, evs);
}

const port = Number(process.env.PORT ?? 8787);
console.log(`Call Pat API listening on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
