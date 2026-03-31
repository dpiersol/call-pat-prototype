import { Link } from "react-router-dom";

export default function ReporterHome() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Report an issue</h1>
      <p className="muted">
        Submit a photo, location, and details. Track status on your reports like a
        311 request.
      </p>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link className="primary" to="/reporter/new" style={{ textAlign: "center", padding: "12px 16px", borderRadius: 8, background: "#1d4ed8", color: "#fff", textDecoration: "none", fontWeight: 600 }}>
          New report
        </Link>
        <Link to="/reporter/my-reports" style={{ textAlign: "center", padding: "12px 16px", borderRadius: 8, border: "1px solid #cbd5e1", textDecoration: "none", color: "#0f172a", fontWeight: 600 }}>
          My reports
        </Link>
      </div>
    </div>
  );
}
