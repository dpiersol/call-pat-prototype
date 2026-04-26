import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import heroArt from "../assets/see-that-montoya.png";
import { fetchMe } from "../api";
import { useSession } from "../session";
import { randomQuip } from "../ui";

export default function ReporterHome() {
  const { token } = useSession();
  const [pointsTotal, setPointsTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      try {
        const me = await fetchMe(token);
        if (!cancelled) setPointsTotal(me.pointsTotal);
      } catch {
        if (!cancelled) setPointsTotal(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div>
      <div className="hero-card card">
        <img src={heroArt} alt="" width={520} height={200} className="hero-art" decoding="async" />
        <h1>
          <span className="hero-see">CABQ </span>
          <span className="hero-that">311</span>
          <span style={{ display: "block", fontSize: "0.92em", marginTop: "0.35rem", fontWeight: 600 }}>
            Field reporting for Burque
          </span>
        </h1>
        <p>
          Snap a photo, drop a pin, add context — dispatch sees it in one clean queue. Built for
          employees; production uses your @cabq.gov sign-in.
        </p>
        {pointsTotal != null ? (
          <p className="hero-points" aria-live="polite">
            <strong>{pointsTotal}</strong> spotter points
          </p>
        ) : null}
        <div className="hero-actions">
          <Link className="hero-primary" to="/reporter/new">
            Report an issue
          </Link>
          <Link className="hero-secondary" to="/reporter/my-reports">
            My reports
          </Link>
        </div>
      </div>
      <p className="muted" style={{ textAlign: "center", marginTop: "1rem", fontStyle: "italic" }}>
        "{randomQuip()}"
      </p>
    </div>
  );
}
