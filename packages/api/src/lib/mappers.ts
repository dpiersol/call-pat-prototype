import type {
  Attachment,
  Report,
  StatusEvent,
  WorkOrder,
} from "@call-pat/shared";
import type { InferSelectModel } from "drizzle-orm";
import type * as schema from "../db/schema.js";

type ReportRow = InferSelectModel<typeof schema.reports>;
type WoRow = InferSelectModel<typeof schema.workOrders>;
type EvRow = InferSelectModel<typeof schema.statusEvents>;
type AttRow = InferSelectModel<typeof schema.attachments>;

export function toStatusEvent(row: EvRow): StatusEvent {
  return {
    id: row.id,
    targetType: row.targetType as StatusEvent["targetType"],
    targetId: row.targetId,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    actorUserId: row.actorUserId,
    note: row.note,
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

export function toAttachment(row: AttRow): Attachment {
  return {
    id: row.id,
    reportId: row.reportId,
    mime: row.mime,
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

export function toReport(
  row: ReportRow,
  attachments?: AttRow[],
  events?: EvRow[],
): Report {
  return {
    id: row.id,
    reporterUserId: row.reporterUserId,
    title: row.title,
    description: row.description,
    category: row.category,
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    addressText: row.addressText ?? null,
    locationSource: row.locationSource as Report["locationSource"],
    status: row.status as Report["status"],
    workOrderId: row.workOrderId ?? null,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    attachments: attachments?.map(toAttachment),
    statusEvents: events?.map(toStatusEvent),
  };
}

export function toWorkOrder(row: WoRow, events?: EvRow[]): WorkOrder {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority as WorkOrder["priority"],
    owningOrg: row.owningOrg,
    assignee: row.assignee ?? null,
    status: row.status as WorkOrder["status"],
    createdFromReportId: row.createdFromReportId ?? null,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    statusEvents: events?.map(toStatusEvent),
  };
}
