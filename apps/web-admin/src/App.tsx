import { Link, Navigate, Route, Routes } from "react-router-dom";
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
  const isEmployee = role === "employee";
  const isStaff = role === "dispatcher" || role === "admin";

  return (
    <div className="layout">
      <header className="row" style={{ marginBottom: "1rem", flexWrap: "wrap" }}>
        <strong>Call Pat</strong>
        {token && (
          <>
            {isEmployee && (
              <span className="row" style={{ gap: 12 }}>
                <Link to="/reporter">Home</Link>
                <Link to="/reporter/new">New report</Link>
                <Link to="/reporter/my-reports">My reports</Link>
              </span>
            )}
            {isStaff && (
              <span className="row" style={{ gap: 12 }}>
                <Link to="/queue">Queue</Link>
              </span>
            )}
            <span className="muted">
              {role} ·{" "}
              <button
                type="button"
                style={{
                  border: "none",
                  background: "none",
                  color: "#1d4ed8",
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={() => {
                  clear();
                  window.location.href = "/login";
                }}
              >
                sign out
              </button>
            </span>
          </>
        )}
      </header>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootRedirect />} />

        <Route
          path="/reporter"
          element={
            token && isEmployee ? <ReporterHome /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/reporter/new"
          element={
            token && isEmployee ? (
              <ReporterNewReport />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/reporter/my-reports"
          element={
            token && isEmployee ? (
              <ReporterMyReports />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/reporter/reports/:id"
          element={
            token && isEmployee ? (
              <ReporterReportDetail />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/queue"
          element={
            token && isStaff ? <Queue /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/reports/:id"
          element={
            token && isStaff ? (
              <ReportDetail />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/work-orders/:id"
          element={
            token && isStaff ? (
              <WorkOrderDetail />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}
