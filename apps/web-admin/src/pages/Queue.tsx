import { REPORT_CATEGORY_OPTIONS } from "@call-pat/shared";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listReportsAdmin } from "../api";
import { useSession } from "../session";
import { useState } from "react";
import { badgeClass } from "../ui";

export default function Queue() {
  const { token } = useSession();
  const [status, setStatus] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const q = useQuery({
    queryKey: ["admin-reports", token, status, category],
    queryFn: () =>
      listReportsAdmin(token!, {
        status: status || undefined,
        category: category || undefined,
      }),
    enabled: !!token,
  });

  if (!token) return null;

  const count = q.data?.reports.length ?? 0;

  return (
    <div>
      <div className="staff-page-head">
        <h1>
          Admin dashboard
          {count > 0 && <span className="count-pill">{count}</span>}
        </h1>
        <p className="staff-page-sub">Triage and assign reported issues</p>
      </div>
      <div className="row" style={{ marginBottom: "1rem" }}>
        <label className="muted">
          Status{" "}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="submitted">submitted</option>
            <option value="triaged">triaged</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
            <option value="closed">closed</option>
          </select>
        </label>
        <label className="muted">
          Category{" "}
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {REPORT_CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      {q.isLoading && <p className="muted">Loading…</p>}
      {q.error && <p style={{ color: "var(--cabq-danger)" }}>{String(q.error)}</p>}
      {q.data && (
        <div className="card" style={{ padding: 0, overflow: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Category</th>
                <th>Title</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {q.data.reports.map((r) => (
                <tr key={r.id}>
                  <td className="muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>{r.category}</td>
                  <td><strong>{r.title}</strong></td>
                  <td><span className={badgeClass(r.status)}>{r.status}</span></td>
                  <td><Link to={`/reports/${r.id}`}>Open →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {q.data.reports.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🎈</div>
              <p>No reports match your filters. The Duke City is looking good!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
