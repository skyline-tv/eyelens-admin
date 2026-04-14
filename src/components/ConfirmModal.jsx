import { useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

/**
 * Reusable confirm dialog with focus trap and Escape to cancel.
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  children,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "danger",
  confirmDisabled = false,
}) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef, isOpen, { onEscape: onCancel });

  if (!isOpen) return null;

  const confirmBtnClass = confirmColor === "danger" ? "btn btn-danger" : "btn btn-primary";

  return (
    <div
      className="adm-modal-overlay"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={onCancel}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="adm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="adm-modal-head">
          <div className="adm-modal-title" id="confirm-modal-title">
            {title}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} aria-label="Close dialog">
            ✕
          </button>
        </div>
        <div className="adm-modal-body">
          {children}
          {!children && message ? (
            <div style={{ fontSize: 13, color: "var(--g600)", lineHeight: 1.6 }}>{message}</div>
          ) : null}
        </div>
        <div
          className="adm-modal-foot"
          style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", alignItems: "center" }}
        >
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={confirmBtnClass}
            disabled={confirmDisabled}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
