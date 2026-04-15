import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { getWorkOrder, patchWorkOrder } from "../api";
import type { WorkOrderStatus } from "@call-pat/shared";
import { useSession } from "../session";
import { badgeClass } from "../ui";

const STATUSES: WorkOrderStatus[] = [
  "new",
  "triaged",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
];

export default function WorkOrderDetail() {
  const { id } = useParams();
  const { token } = useSession();
  const qc = useQueryClient();
  const [note, setNote] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["work-order", id, token],
    queryFn: () => getWorkOrder(token!, id!),
    enabled: !!token && !!id,
  });

  const mut = useMutation({
    mutationFn: (status: WorkOrderStatus) => patchWorkOrder(token!, id!, { status, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-order", id, token] });
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });

  if (!id || !token) return null;

  const wo = q.data;

  return (
    <div>
      <div className="staff-page-head">
        <div className="staff-page-head-main">
          <h1>{wo?.title ?? "Work order"}</h1>
          <p className="staff-page-sub">
            {wo
              ? `${wo.status} · ${wo.priority} priority · ${wo.owningOrg}`
              : "Loading…"}
          </p>
        </div>
        <Link className="staff-back-link" to="/queue">
          ← Queue
        </Link>
      </div>

      {q.isLoading && <p className="muted">Loading…</p>}
      {q.error && <p style={{ color: "var(--cabq-danger)" }}>{String(q.error)}</p>}
      {wo && (
        <div className="card card--panel">
          <div className="report-meta">
            <span className={badgeClass(wo.status)}>{wo.status}</span>
          </div>
          {wo.assignee && (
            <p>
              <strong>Assignee:</strong> {wo.assignee}
            </p>
          )}
          {wo.createdFromReportId && (
            <p>
              From report:{" "}
              <Link to={`/reports/${wo.createdFromReportId}`}>{wo.createdFromReportId}</Link>
            </p>
          )}

          <div
            className="row"
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid var(--cabq-border-light)",
            }}
          >
            <label className="muted">
              Advance status{" "}
              <select
                onChange={(e) => {
                  const v = e.target.value as WorkOrderStatus;
                  if (v) mut.mutate(v);
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Select transition…
                </option>
                {STATUSES.filter((s) => s !== wo.status).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <input
              placeholder="Note (optional)"
              value={note ?? ""}
              onChange={(e) => setNote(e.target.value || null)}
              style={{ minWidth: "12rem", flex: "1 1 160px" }}
            />
          </div>
          {mut.error && <p style={{ color: "var(--cabq-danger)" }}>{String(mut.error)}</p>}

          <h2 className="section-title" style={{ marginTop: "1.25rem" }}>
            Timeline
          </h2>
          <ul className="timeline">
            {(wo.statusEvents ?? []).map((ev) => (
              <li key={ev.id}>
                <strong>{ev.toStatus}</strong>{" "}
                <span className="muted">{new Date(ev.createdAt).toLocaleString()}</span>
                {ev.note && <div className="muted">{ev.note}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
