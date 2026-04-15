import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import {
  createWorkOrder,
  getReport,
  linkReportToWorkOrder,
  listWorkOrders,
} from "../api";
import { useBlobImage } from "../hooks/useBlobImage";
import { useSession } from "../session";
import { badgeClass } from "../ui";

export default function ReportDetail() {
  const { id } = useParams();
  const { token } = useSession();
  const qc = useQueryClient();
  const [woTitle, setWoTitle] = useState("Follow-up from report");
  const [woOrg, setWoOrg] = useState("Streets");
  const [linkId, setLinkId] = useState("");

  const reportQ = useQuery({
    queryKey: ["report", id, token],
    queryFn: () => getReport(token!, id!),
    enabled: !!token && !!id,
  });

  const wosQ = useQuery({
    queryKey: ["work-orders", token],
    queryFn: () => listWorkOrders(token!),
    enabled: !!token,
  });

  const createWo = useMutation({
    mutationFn: () =>
      createWorkOrder(token!, {
        title: woTitle,
        priority: "normal",
        owningOrg: woOrg,
        assignee: null,
        createdFromReportId: id!,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["report", id, token] });
      qc.invalidateQueries({ queryKey: ["work-orders", token] });
    },
  });

  const linkWo = useMutation({
    mutationFn: () => linkReportToWorkOrder(token!, id!, linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["report", id, token] });
    },
  });

  const firstAttachmentId = reportQ.data?.attachments?.[0]?.id;
  const imageSrc = useBlobImage(token, firstAttachmentId);

  if (!id || !token) return null;

  const r = reportQ.data;

  return (
    <div>
      <div className="staff-page-head">
        <div className="staff-page-head-main">
          <h1>{r?.title ?? "Report"}</h1>
          <p className="staff-page-sub">
            {r ? `${r.category} · ${id}` : "Loading report…"}
          </p>
        </div>
        <Link className="staff-back-link" to="/queue">
          ← Queue
        </Link>
      </div>

      {reportQ.isLoading && <p className="muted">Loading…</p>}
      {reportQ.error && <p style={{ color: "var(--cabq-danger)" }}>{String(reportQ.error)}</p>}
      {r && (
        <>
          <div className="card card--panel">
            <div className="report-meta">
              <span className={badgeClass(r.status)}>{r.status}</span>
              <span className="muted">
                Submitted {new Date(r.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="report-body">{r.description}</p>
            <p className="muted">
              📍{" "}
              {r.addressText ?? `${r.lat ?? "—"}, ${r.lng ?? "—"}`} ({r.locationSource})
            </p>
            {imageSrc && (
              <img src={imageSrc} alt="Report attachment" className="report-photo" />
            )}
          </div>

          <div className="card card--panel">
            <h2 className="section-title">Work order</h2>
            {r.workOrderId ? (
              <p>
                Linked:{" "}
                <Link to={`/work-orders/${r.workOrderId}`}>{r.workOrderId}</Link>
              </p>
            ) : (
              <>
                <div className="row" style={{ marginBottom: 8 }}>
                  <input
                    value={woTitle}
                    onChange={(e) => setWoTitle(e.target.value)}
                    placeholder="Title"
                  />
                  <input
                    value={woOrg}
                    onChange={(e) => setWoOrg(e.target.value)}
                    placeholder="Owning org"
                  />
                  <button
                    className="primary"
                    type="button"
                    disabled={createWo.isPending}
                    onClick={() => createWo.mutate()}
                  >
                    Create work order
                  </button>
                </div>
                <div className="row">
                  <select value={linkId} onChange={(e) => setLinkId(e.target.value)}>
                    <option value="">Link existing…</option>
                    {wosQ.data?.workOrders.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.title} ({w.status})
                      </option>
                    ))}
                  </select>
                  <button type="button" disabled={!linkId || linkWo.isPending} onClick={() => linkWo.mutate()}>
                    Link
                  </button>
                </div>
              </>
            )}
            {createWo.error && <p style={{ color: "var(--cabq-danger)" }}>{String(createWo.error)}</p>}
          </div>

          <div className="card card--panel">
            <h2 className="section-title">Status timeline</h2>
            <ul className="timeline">
              {(r.statusEvents ?? []).map((ev) => (
                <li key={ev.id}>
                  <strong>{ev.toStatus}</strong>{" "}
                  <span className="muted">{new Date(ev.createdAt).toLocaleString()}</span>
                  {ev.fromStatus && <div className="muted">from {ev.fromStatus}</div>}
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
