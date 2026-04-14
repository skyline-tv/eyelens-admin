import { useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

/** Generic overlay modal with focus trap and Escape to close. */
export default function AdminModal({ isOpen, onClose, title, ariaLabel, children, footer }) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef, isOpen, { onEscape: onClose });

  if (!isOpen) return null;

  return (
    <div
      className="adm-modal-overlay"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="adm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
      >
        <div className="adm-modal-head">
          <div className="adm-modal-title">{title}</div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>
        <div className="adm-modal-body">{children}</div>
        {footer ? (
          <div
            className="adm-modal-foot"
            style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", alignItems: "center" }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
