import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import BrandWordmark from "./components/BrandWordmark";
import { headerVariantFor, layoutClassFor } from "./layoutTheme";
import Login from "./pages/Login";
import Queue from "./pages/Queue";
import ReportDetail from "./pages/ReportDetail";
import WorkOrderDetail from "./pages/WorkOrderDetail";
import ReporterHome from "./pages/ReporterHome";
import ReporterMyReports from "./pages/ReporterMyReports";
import ReporterNewReport from "./pages/ReporterNewReport";
import ReporterReportDetail from "./pages/ReporterReportDetail";
import { useSession } from "./session";

function RootRedirect() {
  const { token, role } = useSession();
  if (!token) return <Navigate to="/login" replace />;
  if (role === "employee") return <Navigate to="/reporter" replace />;
  return <Navigate to="/queue" replace />;
}

export default function App() {
  const { token, role, clear } = useSession();
  const location = useLocation();
  const isEmployee = role === "employee";
  const isStaff = role === "dispatcher" || role === "admin";
  const headerVariant = headerVariantFor(location.pathname, role, !!token);
  const brandTarget = isEmployee ? "/reporter" : isStaff ? "/queue" : "/login";

  return (
    <>
      {headerVariant !== "none" && (
        <header className={`app-header app-header--${headerVariant}`}>
          <Link to={brandTarget} className="brand">
            <BrandWordmark tone={headerVariant === "staff" ? "on-red" : "on-blue"} />
            <span className="brand-product">
              CABQ 311
              <span className="tagline">City of Albuquerque</span>
            </span>
          </Link>
          {token && (
            <>
              <nav>
                {isEmployee && (
                  <>
                    <Link to="/reporter">Home</Link>
                    <Link to="/reporter/new">New Report</Link>
                    <Link to="/reporter/my-reports">My Reports</Link>
                  </>
                )}
                {isStaff && <Link to="/queue">Queue</Link>}
              </nav>
              <span className="user-info">
                {role}
                <button
                  type="button"
                  className="signout-btn"
                  onClick={() => {
                    clear();
                    window.location.href = "/login";
                  }}
                >
                  Sign out
                </button>
              </span>
            </>
          )}
        </header>
      )}
      <div className={layoutClassFor(location.pathname)}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          <Route path="/reporter" element={token && isEmployee ? <ReporterHome /> : <Navigate to="/login" replace />} />
          <Route path="/reporter/new" element={token && isEmployee ? <ReporterNewReport /> : <Navigate to="/login" replace />} />
          <Route path="/reporter/my-reports" element={token && isEmployee ? <ReporterMyReports /> : <Navigate to="/login" replace />} />
          <Route path="/reporter/reports/:id" element={token && isEmployee ? <ReporterReportDetail /> : <Navigate to="/login" replace />} />

          <Route path="/queue" element={token && isStaff ? <Queue /> : <Navigate to="/login" replace />} />
          <Route path="/reports/:id" element={token && isStaff ? <ReportDetail /> : <Navigate to="/login" replace />} />
          <Route path="/work-orders/:id" element={token && isStaff ? <WorkOrderDetail /> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
    </>
  );
}
