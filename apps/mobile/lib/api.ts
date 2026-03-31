import type {
  CreateReportBody,
  DemoLoginRequest,
  DemoLoginResponse,
  PatchReportBody,
  Report,
} from "@call-pat/shared";

export const API =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8787";

export async function demoLogin(
  email: DemoLoginRequest["email"],
): Promise<DemoLoginResponse> {
  const res = await fetch(`${API}/auth/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<DemoLoginResponse>;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchMyReports(token: string): Promise<{ reports: Report[] }> {
  const res = await fetch(`${API}/reports/mine`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchReport(token: string, id: string): Promise<Report> {
  const res = await fetch(`${API}/reports/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function submitReport(
  token: string,
  body: CreateReportBody,
  photoUri: string,
  mime: string,
): Promise<Report> {
  const form = new FormData();
  form.append("title", body.title);
  form.append("description", body.description);
  form.append("category", body.category);
  form.append("lat", body.lat === null ? "" : String(body.lat));
  form.append("lng", body.lng === null ? "" : String(body.lng));
  form.append("addressText", body.addressText ?? "");
  form.append("locationSource", body.locationSource);
  const name =
    mime === "image/png" ? "photo.png" : mime === "image/webp" ? "photo.webp" : "photo.jpg";
  form.append("photo", {
    uri: photoUri,
    name,
    type: mime,
  } as unknown as Blob);

  const res = await fetch(`${API}/reports`, {
    method: "POST",
    headers: authHeaders(token),
    body: form,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t);
  }
  return res.json() as Promise<Report>;
}

export async function patchReport(
  token: string,
  id: string,
  body: PatchReportBody,
): Promise<Report> {
  const res = await fetch(`${API}/reports/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function attachmentImageSource(token: string, attachmentId: string) {
  return {
    uri: `${API}/attachments/${attachmentId}/file`,
    headers: { Authorization: `Bearer ${token}` },
  };
}
