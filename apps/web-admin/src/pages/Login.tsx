import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { demoLogin } from "../api";
import { useSession } from "../session";

const EMAILS = [
  "dispatcher@demo.local",
  "admin@demo.local",
] as const;

export default function Login() {
  const nav = useNavigate();
  const { setSession } = useSession();
  const [email, setEmail] = useState<(typeof EMAILS)[number]>(EMAILS[0]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await demoLogin(email);
      setSession(res.token, res.user.role);
      nav("/queue");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h1 style={{ marginTop: 0 }}>Dispatcher login (demo)</h1>
      <form onSubmit={onSubmit}>
        <label className="muted" htmlFor="email">
          Demo account
        </label>
        <select
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value as (typeof EMAILS)[number])}
          style={{ width: "100%", marginTop: 6, marginBottom: 12 }}
        >
          {EMAILS.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        {err && <p style={{ color: "#b91c1c" }}>{err}</p>}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
