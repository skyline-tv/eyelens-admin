import { useToast } from "../context/ToastContext";

const icons = {
  success: "✓",
  error: "!",
  info: "i",
  warning: "⚠",
};

export default function ToastHost() {
  const { toasts, dismiss } = useToast();
  if (!toasts?.length) return null;

  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999, display: "grid", gap: 10 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          role="status"
          aria-live="polite"
          style={{ cursor: "pointer" }}
          onClick={() => dismiss(t.id)}
          title="Click to dismiss"
        >
          <span className="toast-icon">{icons[t.type] || icons.info}</span>
          <div style={{ display: "grid", gap: 2 }}>
            {t.title && <div style={{ fontWeight: 900 }}>{t.title}</div>}
            {t.message && <div style={{ opacity: 0.92 }}>{t.message}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

