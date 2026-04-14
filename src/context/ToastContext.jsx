import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext({
  push: (_toast) => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((t) => {
    const toast = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: t?.type || "info",
      title: t?.title || "",
      message: t?.message || "",
      timeoutMs: typeof t?.timeoutMs === "number" ? t.timeoutMs : 3000,
    };
    setToasts((prev) => [...prev, toast]);
    if (toast.timeoutMs > 0) {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== toast.id));
      }, toast.timeoutMs);
    }
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const value = useMemo(() => ({ push, toasts, dismiss }), [push, toasts, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  return useContext(ToastContext);
}

