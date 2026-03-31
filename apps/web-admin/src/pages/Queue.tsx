import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listReportsAdmin } from "../api";
import { useSession } from "../session";
import { useState } from "react";

export default function Queue() {
  const { token } = useSession();
  const [status, setStatus] = useState<string>("");

  const q = useQuery({
    queryKey: ["admin-reports", token, status],
    queryFn: () =>
      listReportsAdmin(token!, {
        status: status || undefined,
      }),
    enabled: !!token,
  });

  if (!token) return null;

  return (
    <div>
      <div className="row" style={{ marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>Report queue</h1>
        <label className="muted">
          Status filter{" "}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="submitted">submitted</option>
            <option value="triaged">triaged</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
            <option value="closed">closed</option>
          </select>
        </label>
      </div>
      {q.isLoading && <p className="muted">Loading…</p>}
      {q.error && (
        <p style={{ color: "#b91c1c" }}>{String(q.error)}</p>
      )}
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
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{r.category}</td>
                  <td>{r.title}</td>
                  <td>
                    <span className="badge">{r.status}</span>
                  </td>
                  <td>
                    <Link to={`/reports/${r.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {q.data.reports.length === 0 && (
            <p className="muted" style={{ padding: "1rem" }}>
              No reports yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
