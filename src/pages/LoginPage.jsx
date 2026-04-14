import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAuthenticated, login } from "../auth/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => location.state?.from || "/dashboard", [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [from, navigate]);

  if (isAuthenticated()) {
    return null;
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--g200)] bg-[var(--card)] px-4 py-3.5 text-sm text-[var(--black)] placeholder:text-[var(--g400)] transition duration-200 " +
    "hover:border-[var(--g300)] focus:border-[var(--em)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(26,107,63,.14)]";

  return (
    <div
      style={{
        minHeight: "100vh",
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--dashboard-bg)",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--g100)",
            borderRadius: 20,
            padding: "2.5rem",
            boxShadow: "0 18px 60px rgba(0,0,0,.08)",
          }}
        >
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                <img
                  src="/LOGO.svg"
                  alt="Eyelens"
                  style={{ height: 48, width: "auto", maxWidth: 220, objectFit: "contain" }}
                />
              </div>
              <div style={{ fontSize: 20, fontWeight: 500, color: "var(--black)", marginBottom: 6 }}>
                Admin Login
              </div>
              <div style={{ fontSize: 13, color: "var(--g500)" }}>Sign in to your admin portal</div>
            </div>

            <form
              style={{ display: "grid", gap: "1.25rem" }}
              onSubmit={async (e) => {
                e.preventDefault();
                if (!canSubmit) return;
                setSubmitting(true);
                setError("");
                try {
                  await login({ email: email.trim().toLowerCase(), password });
                  navigate(from, { replace: true });
                } catch (err) {
                  if (err.code === "FORBIDDEN") {
                    setError("This account does not have admin access.");
                  } else {
                    const msg = err.response?.data?.message || err.message || "Login failed.";
                    setError(msg);
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div style={{ display: "grid", gap: 8 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--g600)",
                  }}
                >
                  Email
                </label>
                <input
                  className={inputClass}
                  style={{ padding: "10px 14px", background: "var(--off)", borderColor: "var(--g200)" }}
                  type="email"
                  placeholder="admin@eyelens.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--g600)",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className={inputClass}
                    style={{ padding: "10px 52px 10px 14px", background: "var(--off)", borderColor: "var(--g200)" }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      fontSize: 12,
                      fontWeight: 800,
                      color: "var(--em)",
                      cursor: "pointer",
                      padding: "6px 8px",
                      borderRadius: 10,
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  style={{
                    borderRadius: 14,
                    border: "1px solid rgba(217,64,64,.28)",
                    background: "rgba(217,64,64,.12)",
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--red)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 14,
                  background: "var(--em)",
                  color: "white",
                  padding: "12px",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  opacity: canSubmit ? 1 : 0.6,
                }}
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>

              <div style={{ textAlign: "center", fontSize: 12, color: "var(--g500)" }}>Use your admin credentials</div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}