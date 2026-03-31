import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { getWorkOrder, patchWorkOrder } from "../api";
import type { WorkOrderStatus } from "@call-pat/shared";
import { useSession } from "../session";

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
    mutationFn: (status: WorkOrderStatus) =>
      patchWorkOrder(token!, id!, { status, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-order", id, token] });
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });

  if (!id || !token) return null;

  return (
    <div>
      <p>
        <Link to="/queue">← Queue</Link>
      </p>
      {q.isLoading && <p className="muted">Loading…</p>}
      {q.error && <p style={{ color: "#b91c1c" }}>{String(q.error)}</p>}
      {q.data && (
        <div className="card">
          <h1 style={{ marginTop: 0 }}>{q.data.title}</h1>
          <p className="muted">
            <span className="badge">{q.data.status}</span> · Priority{" "}
            {q.data.priority} · {q.data.owningOrg}
          </p>
          {q.data.assignee && <p>Assignee: {q.data.assignee}</p>}
          {q.data.createdFromReportId && (
            <p>
              From report:{" "}
              <Link to={`/reports/${q.data.createdFromReportId}`}>
                {q.data.createdFromReportId}
              </Link>
            </p>
          )}
          <div className="row" style={{ marginTop: 12 }}>
            <label className="muted">
              Next status{" "}
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
                {STATUSES.filter((s) => s !== q.data.status).map((s) => (
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
            />
          </div>
          {mut.error && (
            <p style={{ color: "#b91c1c" }}>{String(mut.error)}</p>
          )}

          <h2>Timeline</h2>
          <ul className="timeline">
            {(q.data.statusEvents ?? []).map((ev) => (
              <li key={ev.id}>
                <strong>{ev.toStatus}</strong>{" "}
                <span className="muted">
                  {new Date(ev.createdAt).toLocaleString()}
                </span>
                {ev.note && <div className="muted">{ev.note}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
