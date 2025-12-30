import { useEffect, useRef } from "react";

export default function SettingsModal({ value, onChange, onClose, onReset }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => dialogRef.current?.focus(), []);

  return (
    <div className="overlay" onMouseDown={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Ajustes"
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <h2>Ajustes</h2>
          <button className="xBtn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="row">
          <span>Modo para daltonismo</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={value.colorBlind}
              onChange={(e) => onChange({ ...value, colorBlind: e.target.checked })}
            />
            <span className="slider" />
          </label>
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
            onChange={(e) => onChange({ ...value, contrast: Number(e.target.value) })}
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
            onChange={(e) => onChange({ ...value, brightness: Number(e.target.value) })}
          />
        </div>

        <button className="resetBtn" onClick={onReset}>
          Restablecer
        </button>
      </div>
    </div>
  );
}
