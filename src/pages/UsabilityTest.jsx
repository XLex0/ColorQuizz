import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaintBoard from "../components/PaintBoard";
import "../styles/usability-test.css";

const COLORS = [
  { key: "A", name: "Rojo", hex: "#FF3B3B" },
  { key: "B", name: "Naranja", hex: "#FF9A2E" },
  { key: "C", name: "Amarillo", hex: "#FFD400" },
  { key: "D", name: "Verde", hex: "#31C95A" },
  { key: "E", name: "Celeste", hex: "#14B8FF" },
  { key: "F", name: "Morado", hex: "#6A5CFF" },
  { key: "G", name: "Gris", hex: "#9AA0A6" },
  { key: "H", name: "Rosa", hex: "#D92EE6" },
];

// 5 semillas fijas (puedes cambiarlas)
const SEEDS = [1024, 2048, 4096, 8192, 16384];

export default function UsabilityTest() {
  const nav = useNavigate();

  const totalQuestions = 5;
  const [qIndex, setQIndex] = useState(0); // 0..4
  const [selected, setSelected] = useState(COLORS[0]);
  const [progress, setProgress] = useState({ painted: 0, total: 15 });

  const questionText = useMemo(
    () => `Pregunta ${qIndex + 1}/${totalQuestions}`,
    [qIndex]
  );

    /*const canNext = progress.painted >= progress.total;

    const goNext = () => {
    if (!canNext) return;

    if (qIndex < totalQuestions - 1) {
      setQIndex((p) => p + 1);
      // opcional: resetear color seleccionado en cada pregunta
      setSelected(COLORS[0]);
      // el PaintBoard se resetea solo por cambiar "seed"
      setProgress({ painted: 0, total: 15 });
    } else {
      // Fin del test (por ahora volvemos a Home, o puedes mostrar pantalla final)
      nav("/");
    }
  };*/
  const canNext = true; // ✅ DEV: siempre habilitado

const goNext = () => {
  // ✅ ya no bloquea
  if (qIndex < totalQuestions - 1) {
    setQIndex((p) => p + 1);
    setSelected(COLORS[0]);
    setProgress({ painted: 0, total: 15 });
  } else {
    nav("/");
  }
};


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

            <div className="utPaletteGrid" role="group" aria-label="Paleta de colores">
              {COLORS.map((c) => {
                const active = selected.key === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    className={`utSwatchBtn ${active ? "active" : ""}`}
                    onClick={() => setSelected(c)}
                    aria-pressed={active}
                    title={`${c.key} - ${c.name}`}
                  >
                    <span className="utSwatchColor" style={{ background: c.hex }} />
                    <span className="utSwatchText">
                      <span className="utSwatchKey">{c.key}</span>
                      <span className="utSwatchName">{c.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Dibujo */}
          <section className="utPanel utPanel--board">
            <h2 className="utTitle utTitle--italic">Dibujo a pintar</h2>

            <PaintBoard
              key={SEEDS[qIndex]}         // 👈 fuerza reset cuando cambia pregunta
              seed={SEEDS[qIndex]}        // 👈 posiciones reproducibles por seed
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
