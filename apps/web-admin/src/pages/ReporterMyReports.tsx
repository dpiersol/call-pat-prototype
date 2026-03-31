import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listMyReports } from "../api";
import { useSession } from "../session";

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
      <h1 style={{ marginTop: 0 }}>My reports</h1>
      {q.isLoading && <p className="muted">Loading…</p>}
      {q.error && <p style={{ color: "#b91c1c" }}>{String(q.error)}</p>}
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
                    <Link to={`/reporter/reports/${r.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {q.data.reports.length === 0 && (
            <p className="muted" style={{ padding: "1rem" }}>
              No reports yet.{" "}
              <Link to="/reporter/new">Create one</Link>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
