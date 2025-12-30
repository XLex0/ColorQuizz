import { useState } from "react";

export default function Navbar({ onOpenSettings }) {
  const [tip, setTip] = useState(null);

  return (
    <header className="topbar">
      <div className="brand">COLORQUIZZ</div>

      <nav className="topnav">
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

      {tip && <div className="tooltip">{tip}</div>}
    </header>
  );
}
