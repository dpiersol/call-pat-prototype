import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listMyReports } from "../api";
import { useSession } from "../session";
import { badgeClass } from "../ui";

export default function ReporterMyReports() {
  const { token } = useSession();
  const q = useQuery({
    queryKey: ["my-reports", token],
    queryFn: () => listMyReports(token!),
    enabled: !!token,
  });

  if (!token) return null;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>📋 My Reports</h1>
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
                  <td><Link to={`/reporter/reports/${r.id}`}>Open →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {q.data.reports.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🌄</div>
              <p>No reports yet. <Link to="/reporter/new">Submit your first one!</Link></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
