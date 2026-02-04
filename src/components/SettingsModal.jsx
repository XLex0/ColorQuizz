import { useEffect, useRef } from "react";

export default function SettingsModal({ value, onChange, onClose, onReset }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Focus first focusable element in modal and trap Tab within modal
  useEffect(() => {
    const modal = dialogRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (first) first.focus();

    const onKey = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    modal.addEventListener("keydown", onKey);
    return () => modal.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <h2 id="settings-title">Ajustes</h2>
          <button className="xBtn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="block">
          <div className="label">
            <span>Contraste</span>
            <span className="muted">{value.contrast}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            value={value.contrast}
            onChange={(e) =>
              onChange({ ...value, contrast: Number(e.target.value) })
            }
          />
        </div>

        <div className="block">
          <div className="label">
            <span>Brillo</span>
            <span className="muted">{value.brightness}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            value={value.brightness}
            onChange={(e) =>
              onChange({ ...value, brightness: Number(e.target.value) })
            }
          />
        </div>

        <button className="resetBtn" onClick={onReset}>
          Restablecer
        </button>
      </div>
    </div>
  );
}
