import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaintBoard from "../components/PaintBoard";
import "../styles/usability-test.css";

const COLORS = [
  { key: "A", hex: "#FF3B3B" },
  { key: "B", hex: "#FF9A2E" },
  { key: "C", hex: "#FFD400" },
  { key: "D", hex: "#31C95A" },
  { key: "E", hex: "#14B8FF" },
  { key: "F", hex: "#6A5CFF" },
  { key: "G", hex: "#9AA0A6" },
  { key: "H", hex: "#D92EE6" },
];

const SEEDS = [1024, 2048, 4096, 8192, 16384];

export default function UsabilityTest() {
  const nav = useNavigate();

  const totalQuestions = 5;
  const [qIndex, setQIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState("A");
  const [progress, setProgress] = useState({ painted: 0, total: 15 });

  const selected = useMemo(
    () => COLORS.find((c) => c.key === selectedKey) ?? COLORS[0],
    [selectedKey]
  );

  const questionText = useMemo(
    () => `Pregunta ${qIndex + 1}/${totalQuestions}`,
    [qIndex]
  );

  // ✅ DEV: siempre habilitado (como lo tienes ahora)
  const canNext = true;

  const goNext = () => {
    if (qIndex < totalQuestions - 1) {
      setQIndex((p) => p + 1);
      setSelectedKey("A");
      setProgress({ painted: 0, total: 15 });
    } else {
      nav("/");
    }
  };

  // ✅ Seleccionar color por teclado (A-H)
  useEffect(() => {
    const onKeyDown = (e) => {
      const k = (e.key || "").toUpperCase();
      const valid = COLORS.some((c) => c.key === k);
      if (!valid) return;

      // evita escribir letras en inputs si los hubiera
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      setSelectedKey(k);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="utWrap">
      <header className="utTopbar">
        <h1 className="utBrand">COLORQUIZZ</h1>

        <button className="utExit" type="button" onClick={() => nav("/")}>
          Salir
        </button>
      </header>

      <main className="utMain">
        <div className="utGrid">
          {/* Paleta */}
          <section className="utPanel utPanel--palette">
            <h2 className="utTitle utTitle--italic">Paleta</h2>

            <div className="utPaletteGrid" role="group" aria-label="Paleta de colores (A-H)">
              {COLORS.map((c) => {
                const active = selectedKey === c.key;

                return (
                  <button
                    key={c.key}
                    type="button"
                    className={`utSwatchBtn ${active ? "active" : ""}`}
                    onClick={() => setSelectedKey(c.key)} 
                    aria-pressed={active}
                    title={`Color ${c.key}`} 
                  >
                    <span className="utSwatchColor" style={{ background: c.hex }} />
                    <span className="utSwatchText">
                      <span className="utSwatchKey">{c.key}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* (Opcional) ayudita: */}
            <div className="utHintSmall">
              Selecciona con teclado: <strong>A</strong>–<strong>H</strong>
            </div>
          </section>

          {/* Dibujo */}
          <section className="utPanel utPanel--board">
            <h2 className="utTitle utTitle--italic">Dibujo a pintar</h2>

            <PaintBoard
              key={SEEDS[qIndex]}
              seed={SEEDS[qIndex]}
              circlesCount={15}
              selectedColor={selected.hex}
              onProgress={setProgress}
            />
          </section>

          {/* Referencia */}
          <section className="utPanel utPanel--ref">
            <h2 className="utTitle utTitle--italic">Referencia</h2>
            <div className="utReference" aria-label="Referencia (pendiente)" />
          </section>
        </div>

        <footer className="utFooter">
          <div className="utQuestion">{questionText}</div>

          <button className="utNext" type="button" disabled={!canNext} onClick={goNext}>
            {qIndex < totalQuestions - 1 ? "Siguiente  >" : "Finalizar  >"}
          </button>
        </footer>
      </main>
    </div>
  );
}
