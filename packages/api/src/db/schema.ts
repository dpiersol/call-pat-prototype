import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["employee", "dispatcher", "admin"] }).notNull(),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  reporterUserId: text("reporter_user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  addressText: text("address_text"),
  locationSource: text("location_source", {
    enum: ["gps", "manual", "exif"],
  }).notNull(),
  status: text("status", {
    enum: ["submitted", "triaged", "in_progress", "resolved", "closed"],
  }).notNull(),
  workOrderId: text("work_order_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const workOrders = sqliteTable("work_orders", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  priority: text("priority", {
    enum: ["low", "normal", "high", "urgent"],
  }).notNull(),
  owningOrg: text("owning_org").notNull(),
  assignee: text("assignee"),
  status: text("status", {
    enum: ["new", "triaged", "assigned", "in_progress", "resolved", "closed"],
  }).notNull(),
  createdFromReportId: text("created_from_report_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const statusEvents = sqliteTable("status_events", {
  id: text("id").primaryKey(),
  targetType: text("target_type", { enum: ["report", "work_order"] }).notNull(),
  targetId: text("target_id").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  actorUserId: text("actor_user_id")
    .notNull()
    .references(() => users.id),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(),
  reportId: text("report_id")
    .notNull()
    .references(() => reports.id),
  storageKey: text("storage_key").notNull(),
  mime: text("mime").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

/** Append-only ledger for gamification (spotter points, etc.). */
export const pointsLedger = sqliteTable("points_ledger", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  refType: text("ref_type"),
  refId: text("ref_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});
