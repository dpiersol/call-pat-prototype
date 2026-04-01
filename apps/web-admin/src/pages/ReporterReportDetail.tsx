import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getReport } from "../api";
import { useBlobImage } from "../hooks/useBlobImage";
import { useSession } from "../session";
import { badgeClass } from "../ui";

export default function ReporterReportDetail() {
  const { id } = useParams();
  const { token } = useSession();
  const reportQ = useQuery({
    queryKey: ["report", id, token],
    queryFn: () => getReport(token!, id!),
    enabled: !!token && !!id,
  });

  const attId = reportQ.data?.attachments?.[0]?.id;
  const imageSrc = useBlobImage(token, attId);

  if (!id || !token) return null;

  return (
    <div>
      <p><Link to="/reporter/my-reports">← My reports</Link></p>
      {reportQ.isLoading && <p className="muted">Loading…</p>}
      {reportQ.error && <p style={{ color: "var(--cabq-danger)" }}>{String(reportQ.error)}</p>}
      {reportQ.data && (
        <>
          <div className="card">
            <h1 style={{ marginTop: 0 }}>{reportQ.data.title}</h1>
            <p>
              {reportQ.data.category} &middot;{" "}
              <span className={badgeClass(reportQ.data.status)}>{reportQ.data.status}</span>
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{reportQ.data.description}</p>
            <p className="muted">
              📍{" "}
              {reportQ.data.addressText ??
                `${reportQ.data.lat ?? "—"}, ${reportQ.data.lng ?? "—"}`}{" "}
              ({reportQ.data.locationSource})
            </p>
            {imageSrc && (
              <img src={imageSrc} alt="Report" style={{ maxWidth: "100%", borderRadius: 8, marginTop: 8 }} />
            )}
          </div>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>📜 Status Timeline</h2>
            <ul className="timeline">
              {(reportQ.data.statusEvents ?? []).map((ev) => (
                <li key={ev.id}>
                  <strong>{ev.toStatus}</strong>{" "}
                  <span className="muted">{new Date(ev.createdAt).toLocaleString()}</span>
                  {ev.note && <div className="muted">{ev.note}</div>}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
