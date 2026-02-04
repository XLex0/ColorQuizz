import { useId, useRef, useState } from "react";

export default function Navbar({ onOpenSettings }) {
  const [tip, setTip] = useState(null);
  const [tipOwner, setTipOwner] = useState(null); // "who" | "purpose" | null
  const navRef = useRef(null);

  const tooltipId = useId(); // id único para aria-describedby

  const showTip = (owner, text) => {
    setTipOwner(owner);
    setTip(text);
  };

  const hideTip = () => {
    setTipOwner(null);
    setTip(null);
  };

  const handleNavKeyDown = (e) => {
    const nav = navRef.current;
    if (!nav) return;
    const buttons = Array.from(nav.querySelectorAll("button.toplink"));
    if (!buttons.length) return;

    const idx = buttons.indexOf(document.activeElement);

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = buttons[(idx + 1) % buttons.length];
      next?.focus();
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = buttons[(idx - 1 + buttons.length) % buttons.length];
      prev?.focus();
    }
  };

  return (
    <header className="topbar">
      <div className="topbarInner">
        <div className="brand">COLORQUIZZ</div>

        <nav
          className="topnav"
          role="navigation"
          aria-label="Navegación principal"
          ref={navRef}
          onKeyDown={handleNavKeyDown}
        >
          <button
            className="toplink"
            aria-describedby={tip && tipOwner === "who" ? tooltipId : undefined}
            onMouseEnter={() =>
              showTip(
                "who",
                "ColorQuizz es un proyecto creado para ayudarte a descubrir, de forma rápida y divertida, posibles indicios de daltonismo."
              )
            }
            onMouseLeave={hideTip}
            onFocus={() =>
              showTip(
                "who",
                "ColorQuizz es un proyecto creado para ayudarte a descubrir, de forma rápida y divertida, posibles indicios de daltonismo."
              )
            }
            onBlur={hideTip}
          >
            ¿Quiénes somos?
          </button>

          <button
            className="toplink"
            aria-describedby={tip && tipOwner === "purpose" ? tooltipId : undefined}
            onMouseEnter={() =>
              showTip(
                "purpose",
                "Ofrecer una forma sencilla y confiable de detectar posibles alteraciones en la percepción del color."
              )
            }
            onMouseLeave={hideTip}
            onFocus={() =>
              showTip(
                "purpose",
                "Ofrecer una forma sencilla y confiable de detectar posibles alteraciones en la percepción del color."
              )
            }
            onBlur={hideTip}
          >
            Propósito
          </button>
        </nav>

        <button className="gearBtn" onClick={onOpenSettings} aria-label="Ajustes">
          ⚙️
        </button>
      </div>

      {/* ✅ Tooltip accesible para lectores de pantalla */}
      <div
        id={tooltipId}
        className="tooltip"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {tip ?? ""}
      </div>
    </header>
  );
}
