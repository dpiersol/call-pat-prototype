import type {
  CreateWorkOrderBody,
  DemoLoginRequest,
  DemoLoginResponse,
  PatchWorkOrderBody,
  Report,
  WorkOrder,
} from "@call-pat/shared";

const API =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:8787";

function authHeaders(token: string | null): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function demoLogin(
  email: DemoLoginRequest["email"],
): Promise<DemoLoginResponse> {
  const res = await fetch(`${API}/auth/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<DemoLoginResponse>;
}

export async function listReportsAdmin(
  token: string,
  params?: { status?: string; from?: string; to?: string },
): Promise<{ reports: Report[] }> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.from) q.set("from", params.from);
  if (params?.to) q.set("to", params.to);
  const res = await fetch(`${API}/admin/reports?${q}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getReport(token: string, id: string): Promise<Report> {
  const res = await fetch(`${API}/reports/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listWorkOrders(
  token: string,
): Promise<{ workOrders: WorkOrder[] }> {
  const res = await fetch(`${API}/admin/work-orders`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getWorkOrder(
  token: string,
  id: string,
): Promise<WorkOrder> {
  const res = await fetch(`${API}/admin/work-orders/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createWorkOrder(
  token: string,
  body: CreateWorkOrderBody,
): Promise<WorkOrder> {
  const res = await fetch(`${API}/admin/work-orders`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function patchWorkOrder(
  token: string,
  id: string,
  body: PatchWorkOrderBody,
): Promise<WorkOrder> {
  const res = await fetch(`${API}/admin/work-orders/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function linkReportToWorkOrder(
  token: string,
  reportId: string,
  workOrderId: string,
): Promise<Report> {
  const res = await fetch(`${API}/admin/reports/${reportId}/link-work-order`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ workOrderId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function patchReportStatus(
  token: string,
  reportId: string,
  status: string,
  note?: string | null,
): Promise<Report> {
  const res = await fetch(`${API}/admin/reports/${reportId}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function attachmentUrl(attachmentId: string): string {
  return `${API}/attachments/${attachmentId}/file`;
}

export { API };
