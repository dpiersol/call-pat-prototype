import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { demoLogin } from "../api";
import { useSession } from "../session";
import type { DemoLoginRequest } from "@call-pat/shared";

const EMAILS: DemoLoginRequest["email"][] = [
  "reporter@demo.local",
  "dispatcher@demo.local",
  "admin@demo.local",
];

export default function Login() {
  const nav = useNavigate();
  const { setSession } = useSession();
  const [email, setEmail] = useState<DemoLoginRequest["email"]>(EMAILS[0]);
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
    <div className="card" style={{ maxWidth: 420 }}>
      <h1 style={{ marginTop: 0 }}>Sign in (demo)</h1>
      <p className="muted">
        Passwordless demo accounts — no real SSO in this prototype.
      </p>
      <form onSubmit={onSubmit}>
        <label className="muted" htmlFor="email">
          Account
        </label>
        <select
          id="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value as DemoLoginRequest["email"])
          }
          style={{ width: "100%", marginTop: 6, marginBottom: 12 }}
        >
          {EMAILS.map((x) => (
            <option key={x} value={x}>
              {x} (
              {x.startsWith("reporter")
                ? "employee"
                : x.startsWith("dispatcher")
                  ? "dispatcher"
                  : "admin"}
              )
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
