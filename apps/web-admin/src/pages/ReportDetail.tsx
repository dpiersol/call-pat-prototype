import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  attachmentUrl,
  createWorkOrder,
  getReport,
  linkReportToWorkOrder,
  listWorkOrders,
} from "../api";
import { useSession } from "../session";

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

  return (
    <div>
      <p>
        <Link to="/queue">← Queue</Link>
      </p>
      {reportQ.isLoading && <p className="muted">Loading…</p>}
      {reportQ.error && (
        <p style={{ color: "#b91c1c" }}>{String(reportQ.error)}</p>
      )}
      {reportQ.data && (
        <>
          <div className="card">
            <h1 style={{ marginTop: 0 }}>{reportQ.data.title}</h1>
            <p className="muted">
              {reportQ.data.category} ·{" "}
              <span className="badge">{reportQ.data.status}</span>
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{reportQ.data.description}</p>
            <p className="muted">
              Location:{" "}
              {reportQ.data.addressText ??
                `${reportQ.data.lat ?? "—"}, ${reportQ.data.lng ?? "—"}`}{" "}
              ({reportQ.data.locationSource})
            </p>
            {imageSrc && (
              <img
                src={imageSrc}
                alt="Report attachment"
                style={{ maxWidth: "100%", borderRadius: 8 }}
              />
            )}
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>Work order</h2>
            {reportQ.data.workOrderId ? (
              <p>
                Linked:{" "}
                <Link to={`/work-orders/${reportQ.data.workOrderId}`}>
                  {reportQ.data.workOrderId}
                </Link>
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
                  <select
                    value={linkId}
                    onChange={(e) => setLinkId(e.target.value)}
                  >
                    <option value="">Link existing…</option>
                    {wosQ.data?.workOrders.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.title} ({w.status})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!linkId || linkWo.isPending}
                    onClick={() => linkWo.mutate()}
                  >
                    Link
                  </button>
                </div>
              </>
            )}
            {createWo.error && (
              <p style={{ color: "#b91c1c" }}>{String(createWo.error)}</p>
            )}
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>Status timeline</h2>
            <ul className="timeline">
              {(reportQ.data.statusEvents ?? []).map((ev) => (
                <li key={ev.id}>
                  <strong>{ev.toStatus}</strong>{" "}
                  <span className="muted">
                    {new Date(ev.createdAt).toLocaleString()}
                  </span>
                  {ev.fromStatus && (
                    <div className="muted">from {ev.fromStatus}</div>
                  )}
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

function useBlobImage(token: string | null, attachmentId: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !attachmentId) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    (async () => {
      const res = await fetch(attachmentUrl(attachmentId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);
      if (!cancelled) setUrl(objectUrl);
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token, attachmentId]);

  return url;
}
