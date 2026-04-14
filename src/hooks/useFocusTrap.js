import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Trap focus inside container while open; Tab cycles; Escape calls onEscape.
 * Restores focus to the element that was focused when the modal opened.
 */
export function useFocusTrap(containerRef, isOpen, { onEscape } = {}) {
  const prevActiveRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    prevActiveRef.current = document.activeElement;
    const container = containerRef.current;
    if (!container) return undefined;

    const getFocusable = () =>
      Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    const t = requestAnimationFrame(() => {
      const els = getFocusable();
      if (els.length) els[0].focus();
      else container.setAttribute("tabindex", "-1");
    });

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onEscape?.();
        return;
      }
      if (e.key !== "Tab" || !container) return;

      const els = getFocusable();
      if (els.length === 0) return;
      if (els.length === 1) {
        e.preventDefault();
        els[0].focus();
        return;
      }

      const first = els[0];
      const last = els[els.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener("keydown", onKeyDown, true);
      const prev = prevActiveRef.current;
      if (prev && typeof prev.focus === "function") {
        try {
          prev.focus();
        } catch {
          /* ignore */
        }
      }
    };
  }, [isOpen, containerRef, onEscape]);
}
