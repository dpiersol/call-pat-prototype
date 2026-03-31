import { z } from "zod";

export const roleSchema = z.enum(["employee", "dispatcher", "admin"]);
export type Role = z.infer<typeof roleSchema>;

export const locationSourceSchema = z.enum(["gps", "manual", "exif"]);
export type LocationSource = z.infer<typeof locationSourceSchema>;

/** Default labels for new reports (keep in sync across clients). */
export const REPORT_CATEGORY_OPTIONS = [
  "Needles",
  "Graffiti",
  "Pothole",
  "Other",
] as const;
export type ReportCategoryOption = (typeof REPORT_CATEGORY_OPTIONS)[number];

export const reportStatusSchema = z.enum([
  "submitted",
  "triaged",
  "in_progress",
  "resolved",
  "closed",
]);
export type ReportStatus = z.infer<typeof reportStatusSchema>;

export const workOrderStatusSchema = z.enum([
  "new",
  "triaged",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
]);
export type WorkOrderStatus = z.infer<typeof workOrderStatusSchema>;

export const prioritySchema = z.enum(["low", "normal", "high", "urgent"]);
export type Priority = z.infer<typeof prioritySchema>;

export const targetTypeSchema = z.enum(["report", "work_order"]);
export type StatusEventTargetType = z.infer<typeof targetTypeSchema>;

export const userSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  role: roleSchema,
});
export type User = z.infer<typeof userSchema>;

export const statusEventSchema = z.object({
  id: z.string().uuid(),
  targetType: targetTypeSchema,
  targetId: z.string().uuid(),
  fromStatus: z.string().nullable(),
  toStatus: z.string(),
  actorUserId: z.string().uuid(),
  note: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type StatusEvent = z.infer<typeof statusEventSchema>;

export const attachmentSchema = z.object({
  id: z.string().uuid(),
  reportId: z.string().uuid(),
  mime: z.string(),
  createdAt: z.string().datetime(),
});
export type Attachment = z.infer<typeof attachmentSchema>;

export const reportSchema = z.object({
  id: z.string().uuid(),
  reporterUserId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  addressText: z.string().nullable(),
  locationSource: locationSourceSchema,
  status: reportStatusSchema,
  workOrderId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  attachments: z.array(attachmentSchema).optional(),
  statusEvents: z.array(statusEventSchema).optional(),
});
export type Report = z.infer<typeof reportSchema>;

export const workOrderSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  priority: prioritySchema,
  owningOrg: z.string(),
  assignee: z.string().nullable(),
  status: workOrderStatusSchema,
  createdFromReportId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  statusEvents: z.array(statusEventSchema).optional(),
});
export type WorkOrder = z.infer<typeof workOrderSchema>;

export const demoLoginRequestSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.enum(["reporter@demo.local", "dispatcher@demo.local", "admin@demo.local"]),
});
export type DemoLoginRequest = z.infer<typeof demoLoginRequestSchema>;

export const demoLoginResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
});
export type DemoLoginResponse = z.infer<typeof demoLoginResponseSchema>;

export const createReportBodySchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(8000),
  category: z.string().min(1).max(200),
  lat: z.coerce.number().min(-90).max(90).nullable(),
  lng: z.coerce.number().min(-180).max(180).nullable(),
  addressText: z.string().max(2000).nullable().optional(),
  locationSource: locationSourceSchema,
});
export type CreateReportBody = z.infer<typeof createReportBodySchema>;

export const patchReportBodySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).max(8000).optional(),
  category: z.string().min(1).max(200).optional(),
  lat: z.coerce.number().min(-90).max(90).nullable().optional(),
  lng: z.coerce.number().min(-180).max(180).nullable().optional(),
  addressText: z.string().max(2000).nullable().optional(),
  locationSource: locationSourceSchema.optional(),
});
export type PatchReportBody = z.infer<typeof patchReportBodySchema>;

export const createWorkOrderBodySchema = z.object({
  title: z.string().min(1).max(500),
  priority: prioritySchema,
  owningOrg: z.string().min(1).max(500),
  assignee: z.string().max(500).nullable().optional(),
  createdFromReportId: z.string().uuid().nullable().optional(),
});
export type CreateWorkOrderBody = z.infer<typeof createWorkOrderBodySchema>;

export const patchWorkOrderBodySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  priority: prioritySchema.optional(),
  owningOrg: z.string().min(1).max(500).optional(),
  assignee: z.string().max(500).nullable().optional(),
  status: workOrderStatusSchema.optional(),
  note: z.string().max(2000).nullable().optional(),
});
export type PatchWorkOrderBody = z.infer<typeof patchWorkOrderBodySchema>;

export const listReportsQuerySchema = z.object({
  status: reportStatusSchema.optional(),
  /** Exact match on stored category label */
  category: z.string().max(200).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>;
