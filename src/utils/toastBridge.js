let toastHandler = null;
let lastToast = { key: "", ts: 0 };

export function registerToastHandler(handler) {
  toastHandler = typeof handler === "function" ? handler : null;
}

export function notifyToast(toast) {
  if (!toastHandler || !toast?.message) return;
  const type = toast.type || "info";
  const title = toast.title || "";
  const key = `${type}:${title}:${toast.message}`;
  const now = Date.now();
  if (lastToast.key === key && now - lastToast.ts < 1200) return;
  lastToast = { key, ts: now };
  toastHandler({
    type,
    title,
    message: toast.message,
    timeoutMs: typeof toast.timeoutMs === "number" ? toast.timeoutMs : undefined,
  });
}
