import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { injectStyles } from "./styles/eyelensStyles";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import { logout } from "./auth/auth";
import { ToastProvider } from "./context/ToastContext";
import ToastHost from "./components/ToastHost";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    injectStyles();
  }, []);

  return (
    <ToastProvider>
      <ToastHost />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <AdminPage
                onLogout={async () => {
                  await logout();
                  navigate("/login", { replace: true });
                }}
                courierReceipts={[]}
                lensReceipts={[]}
                setCourierReceipts={() => {}}
                setLensReceipts={() => {}}
              />
            }
          />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ToastProvider>
  );
}
