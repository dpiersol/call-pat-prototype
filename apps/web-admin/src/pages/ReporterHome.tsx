import { Link } from "react-router-dom";
import { randomQuip } from "../ui";

export default function ReporterHome() {
  return (
    <div>
      <div className="hero-card card">
        <h1>🌵 Hey there, Burqueño!</h1>
        <p>
          See a pothole on Central? Graffiti near the Rail Runner? Needles at
          the park? Snap a photo, drop a pin, and let us handle it.
        </p>
        <div className="hero-actions">
          <Link className="hero-primary" to="/reporter/new">
            📸 New Report
          </Link>
          <Link className="hero-secondary" to="/reporter/my-reports">
            📋 My Reports
          </Link>
        </div>
      </div>
      <p className="muted" style={{ textAlign: "center", marginTop: "1rem", fontStyle: "italic" }}>
        "{randomQuip()}"
      </p>
    </div>
  );
}
