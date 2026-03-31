import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Queue from "./pages/Queue";
import ReportDetail from "./pages/ReportDetail";
import WorkOrderDetail from "./pages/WorkOrderDetail";
import { useSession } from "./session";

export default function App() {
  const { token, role, clear } = useSession();

  return (
    <div className="layout">
      <header className="row" style={{ marginBottom: "1rem" }}>
        <strong>Call Pat — Admin</strong>
        {token && (
          <span className="muted">
            signed in as {role} ·{" "}
            <button
              type="button"
              style={{ border: "none", background: "none", color: "#1d4ed8", cursor: "pointer", padding: 0 }}
              onClick={() => {
                clear();
                window.location.href = "/login";
              }}
            >
              sign out
            </button>
          </span>
        )}
      </header>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/queue"
          element={
            token && (role === "dispatcher" || role === "admin") ? (
              <Queue />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/reports/:id"
          element={
            token && (role === "dispatcher" || role === "admin") ? (
              <ReportDetail />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/work-orders/:id"
          element={
            token && (role === "dispatcher" || role === "admin") ? (
              <WorkOrderDetail />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to="/queue" replace />} />
      </Routes>
    </div>
  );
}
