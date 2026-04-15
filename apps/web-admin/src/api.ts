import type {
  CreateWorkOrderBody,
  DemoLoginRequest,
  DemoLoginResponse,
  PatchWorkOrderBody,
  Report,
  WorkOrder,
} from "@call-pat/shared";

/** In dev, default to same-origin so Vite can proxy to the API (see vite.config.ts). */
function resolveApiBase(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (raw != null && String(raw).trim() !== "") {
    return raw.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) return "";
  return "http://127.0.0.1:8787";
}

const API = resolveApiBase();

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
  params?: { status?: string; category?: string; from?: string; to?: string },
): Promise<{ reports: Report[] }> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.category) q.set("category", params.category);
  if (params?.from) q.set("from", params.from);
  if (params?.to) q.set("to", params.to);
  const res = await fetch(`${API}/admin/reports?${q}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listMyReports(
  token: string,
): Promise<{ reports: Report[] }> {
  const res = await fetch(`${API}/reports/mine`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Multipart POST — do not set Content-Type (browser sets boundary). */
export async function submitReport(
  token: string,
  form: FormData,
): Promise<Report> {
  const res = await fetch(`${API}/reports`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Report>;
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
