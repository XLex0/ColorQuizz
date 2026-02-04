import { useState, useRef } from "react";

export default function Navbar({ onOpenSettings }) {
  const [tip, setTip] = useState(null);
  const navRef = useRef(null);

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
            onMouseEnter={() =>
              setTip(
                "ColorQuizz es un proyecto creado para ayudarte a descubrir, de forma rápida y divertida, posibles indicios de daltonismo."
              )
            }
            onMouseLeave={() => setTip(null)}
          >
            ¿Quiénes somos?
          </button>

          <button
            className="toplink"
            onMouseEnter={() =>
              setTip(
                "Ofrecer una forma sencilla y confiable de detectar posibles alteraciones en la percepción del color."
              )
            }
            onMouseLeave={() => setTip(null)}
          >
            Propósito
          </button>
        </nav>

        <button className="gearBtn" onClick={onOpenSettings} aria-label="Ajustes">
          ⚙️
        </button>
      </div>

      {tip && <div className="tooltip">{tip}</div>}
    </header>
  );
}
