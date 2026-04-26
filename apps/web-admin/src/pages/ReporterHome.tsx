import { Link } from "react-router-dom";
import heroArt from "../assets/see-that-montoya.png";
import { randomQuip } from "../ui";

export default function ReporterHome() {
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
