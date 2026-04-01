import { REPORT_CATEGORY_OPTIONS } from "@call-pat/shared";
import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { submitReport } from "../api";
import { useSession } from "../session";

export default function ReporterNewReport() {
  const { token } = useSession();
  const nav = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(REPORT_CATEGORY_OPTIONS[0]);
  const [lat, setLat] = useState("35.0844");
  const [lng, setLng] = useState("-106.6504");
  const [addressText, setAddressText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !file) {
      setErr("Photo and sign-in required.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("category", category);
      form.append("lat", lat.trim() === "" ? "" : String(Number(lat)));
      form.append("lng", lng.trim() === "" ? "" : String(Number(lng)));
      form.append("addressText", addressText.trim());
      form.append("locationSource", "manual");
      form.append("photo", file);
      const report = await submitReport(token, form);
      nav(`/reporter/reports/${report.id}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>📸 New Report</h1>
      <form className="card" onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label className="muted">Photo (required)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <label className="muted">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%" }}>
          {REPORT_CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label className="muted">Short title</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: 8 }} />

        <label className="muted">Description — what did you see?</label>
        <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ width: "100%", padding: 8 }} />

        <p className="muted" style={{ margin: 0 }}>
          📍 Location — adjust lat/lng or add a cross street
        </p>
        <div className="row">
          <label>Lat <input value={lat} onChange={(e) => setLat(e.target.value)} style={{ width: 120 }} /></label>
          <label>Lng <input value={lng} onChange={(e) => setLng(e.target.value)} style={{ width: 120 }} /></label>
        </div>

        <label className="muted">Cross street / address (optional)</label>
        <input value={addressText} onChange={(e) => setAddressText(e.target.value)} style={{ width: "100%", padding: 8 }} />

        {err && <p style={{ color: "var(--cabq-danger)" }}>{err}</p>}
        <button className="primary" type="submit" disabled={loading} style={{ padding: "0.7rem" }}>
          {loading ? "Submitting…" : "🚀 Submit Report"}
        </button>
      </form>
    </div>
  );
}
