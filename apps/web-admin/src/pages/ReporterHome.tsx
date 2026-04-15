import { Link } from "react-router-dom";
import { randomQuip } from "../ui";

export default function ReporterHome() {
  return (
    <div>
      <div className="hero-card card">
        <h1>
          <span className="hero-see">SEE </span>
          <span className="hero-that">THAT?</span>
          <span style={{ display: "block", fontSize: "0.92em", marginTop: "0.35rem", fontWeight: 600 }}>
            Report an issue in Burque
          </span>
        </h1>
        <p>
          Help keep Albuquerque clean and safe — snap a photo, drop a pin, and
          we will route it to the right crew.
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
