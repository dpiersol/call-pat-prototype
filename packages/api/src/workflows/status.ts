import type { ReportStatus, WorkOrderStatus } from "@call-pat/shared";

const reportTransitions: Record<ReportStatus, ReportStatus[]> = {
  submitted: ["triaged", "in_progress", "resolved", "closed"],
  triaged: ["in_progress", "resolved", "closed"],
  in_progress: ["resolved", "closed", "triaged"],
  resolved: ["closed", "in_progress"],
  closed: [],
};

const workOrderTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  new: ["triaged", "assigned", "in_progress", "resolved", "closed"],
  triaged: ["assigned", "in_progress", "resolved", "closed"],
  assigned: ["in_progress", "resolved", "closed", "triaged"],
  in_progress: ["resolved", "closed", "assigned"],
  resolved: ["closed", "in_progress"],
  closed: [],
};

export function canTransitionReport(
  from: ReportStatus,
  to: ReportStatus,
): boolean {
  return reportTransitions[from]?.includes(to) ?? false;
}

export function canTransitionWorkOrder(
  from: WorkOrderStatus,
  to: WorkOrderStatus,
): boolean {
  return workOrderTransitions[from]?.includes(to) ?? false;
}
