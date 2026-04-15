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

  const r = reportQ.data;

  return (
    <div>
      <div className="reporter-page-head reporter-page-head--detail">
        <div className="reporter-page-head-main">
          <h1>{r?.title ?? "Report"}</h1>
          <p className="reporter-page-sub">
            {r ? `${r.category} · ${id}` : "Loading report…"}
          </p>
        </div>
        <Link className="reporter-back-link" to="/reporter/my-reports">
          ← My reports
        </Link>
      </div>

      {reportQ.isLoading && <p className="muted">Loading…</p>}
      {reportQ.error && <p style={{ color: "var(--cabq-danger)" }}>{String(reportQ.error)}</p>}
      {r && (
        <>
          <div className="card card--panel">
            <div className="report-meta">
              <span className={badgeClass(r.status)}>{r.status}</span>
              <span className="muted">Submitted {new Date(r.createdAt).toLocaleString()}</span>
            </div>
            <p className="report-body">{r.description}</p>
            <p className="muted">
              📍{" "}
              {r.addressText ?? `${r.lat ?? "—"}, ${r.lng ?? "—"}`} ({r.locationSource})
            </p>
            {imageSrc && <img src={imageSrc} alt="Report" className="report-photo" />}
          </div>
          <div className="card card--panel">
            <h2 className="section-title">Status timeline</h2>
            <ul className="timeline">
              {(r.statusEvents ?? []).map((ev) => (
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
