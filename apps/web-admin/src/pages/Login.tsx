import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { demoLogin } from "../api";
import { useSession } from "../session";
import type { DemoLoginRequest } from "@call-pat/shared";

const ACCOUNTS: { email: DemoLoginRequest["email"]; label: string }[] = [
  { email: "reporter@demo.local", label: "Field Reporter (employee)" },
  { email: "dispatcher@demo.local", label: "Dispatcher" },
  { email: "admin@demo.local", label: "Admin" },
];

export default function Login() {
  const nav = useNavigate();
  const { setSession } = useSession();
  const [email, setEmail] = useState<DemoLoginRequest["email"]>(ACCOUNTS[0].email);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await demoLogin(email);
      setSession(res.token, res.user.role);
      if (res.user.role === "employee") {
        nav("/reporter", { replace: true });
      } else {
        nav("/queue", { replace: true });
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card login-card">
      <div className="product-lockup" aria-hidden>
        <span className="see">SEE </span>
        <span className="that">THAT?</span>
      </div>
      <h1>Call Pat</h1>
      <p className="muted" style={{ marginBottom: "1.2rem" }}>
        City Employee Issue Reporting
        <br />
        <small>Demo mode &middot; production will use @cabq.gov SSO</small>
      </p>
      <form onSubmit={onSubmit}>
        <label className="muted" htmlFor="email" style={{ display: "block", textAlign: "left", marginBottom: 4 }}>
          Demo account
        </label>
        <select
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value as DemoLoginRequest["email"])}
          style={{ width: "100%", marginBottom: 14, padding: "0.5rem" }}
        >
          {ACCOUNTS.map((a) => (
            <option key={a.email} value={a.email}>{a.label} — {a.email}</option>
          ))}
        </select>
        {err && <p style={{ color: "var(--cabq-danger)" }}>{err}</p>}
        <button className="primary" type="submit" disabled={loading} style={{ width: "100%", padding: "0.7rem" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: "1.5rem", fontSize: "0.78rem" }}>
        🎈 Built with green chile and good intentions
      </p>
    </div>
  );
}
