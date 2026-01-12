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

const SEEDS = [1024, 2048, 3072, 4096, 5120];

// Configuración de pruebas
const TESTS = [
  {
    id: 0,
    name: "Prueba Rojo-Verde",
    colors: [
      { x: 0.22, y: 0.22, hex: "#FF3B3B" },  // Rojo
      { x: 0.5, y: 0.22, hex: "#31C95A" },   // Verde
      { x: 0.78, y: 0.22, hex: "#FF9A2E" },  // Naranja
      { x: 0.22, y: 0.5, hex: "#FFD400" },   // Amarillo
      { x: 0.5, y: 0.5, hex: "#14B8FF" },    // Azul
      { x: 0.78, y: 0.5, hex: "#6A5CFF" },   // Morado
      { x: 0.36, y: 0.78, hex: "#9AA0A6" },  // Gris
      { x: 0.64, y: 0.78, hex: "#D92EE6" },  // Rosa
    ]
  },
  {
    id: 1,
    name: "Prueba Amarillo-Rosado",
    colors: [
      { x: 0.22, y: 0.22, hex: "#FFD400" },  // Amarillo
      { x: 0.5, y: 0.22, hex: "#14B8FF" },   // Azul
      { x: 0.78, y: 0.22, hex: "#D92EE6" },  // Rosa
      { x: 0.22, y: 0.5, hex: "#FF3B3B" },   // Rojo
      { x: 0.5, y: 0.5, hex: "#31C95A" },    // Verde
      { x: 0.78, y: 0.5, hex: "#9AA0A6" },   // Gris
      { x: 0.36, y: 0.78, hex: "#6A5CFF" },  // Morado
      { x: 0.64, y: 0.78, hex: "#FF9A2E" },  // Naranja
    ]
  }
  ,
  // Placeholder tests so teammates can edit their specific questions
  {
    id: 2,
    name: "Prueba 3 (placeholder)",
    colors: [
      { x: 0.22, y: 0.22, hex: "#FF3B3B" },
      { x: 0.5, y: 0.22, hex: "#FF9A2E" },
      { x: 0.78, y: 0.22, hex: "#FFD400" },
      { x: 0.22, y: 0.5, hex: "#31C95A" },
      { x: 0.5, y: 0.5, hex: "#14B8FF" },
      { x: 0.78, y: 0.5, hex: "#6A5CFF" },
      { x: 0.36, y: 0.78, hex: "#9AA0A6" },
      { x: 0.64, y: 0.78, hex: "#D92EE6" },
    ]
  },
  {
    id: 3,
    name: "Prueba 4 (placeholder)",
    colors: [
      { x: 0.22, y: 0.22, hex: "#FFD400" },
      { x: 0.5, y: 0.22, hex: "#14B8FF" },
      { x: 0.78, y: 0.22, hex: "#D92EE6" },
      { x: 0.22, y: 0.5, hex: "#FF3B3B" },
      { x: 0.5, y: 0.5, hex: "#31C95A" },
      { x: 0.78, y: 0.5, hex: "#9AA0A6" },
      { x: 0.36, y: 0.78, hex: "#6A5CFF" },
      { x: 0.64, y: 0.78, hex: "#FF9A2E" },
    ]
  },
  {
    id: 4,
    name: "Prueba 5 (placeholder)",
    colors: [
      { x: 0.22, y: 0.22, hex: "#14B8FF" },
      { x: 0.5, y: 0.22, hex: "#FF3B3B" },
      { x: 0.78, y: 0.22, hex: "#31C95A" },
      { x: 0.22, y: 0.5, hex: "#FF9A2E" },
      { x: 0.5, y: 0.5, hex: "#6A5CFF" },
      { x: 0.78, y: 0.5, hex: "#D92EE6" },
      { x: 0.36, y: 0.78, hex: "#9AA0A6" },
      { x: 0.64, y: 0.78, hex: "#FFD400" },
    ]
  }
];

/** PRNG reproducible por seed (Mulberry32) - igual que PaintBoard */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateCircles({ count, seed }) {
  const rand = mulberry32(seed ?? 1);
  const circles = [];
  const minDist = 0.14;
  let attempts = 0;

  while (circles.length < count && attempts < 4000) {
    attempts++;
    const x = 0.08 + rand() * 0.84;
    const y = 0.08 + rand() * 0.84;

    const ok = circles.every((c) => {
      const dx = c.x - x;
      const dy = c.y - y;
      return Math.sqrt(dx * dx + dy * dy) >= minDist;
    });

    if (ok) circles.push({ id: `c${circles.length + 1}`, x, y });
  }

  while (circles.length < count) {
    circles.push({
      id: `c${circles.length + 1}`,
      x: 0.08 + rand() * 0.84,
      y: 0.08 + rand() * 0.84,
    });
  }

  return circles;
}

// Generar imagen de referencia con colores pintados en las mismas posiciones
function generateReferenceImage(testId, seed, circlesCount) {
  const test = TESTS[testId];
  const circles = generateCircles({ count: circlesCount, seed });
  
  // Mapear cada círculo del tablero a un color de la prueba
  let circlesHtml = circles.map((c, idx) => {
    const colorHex = test.colors[idx % test.colors.length].hex;
    return `
      <circle cx="${c.x * 360}" cy="${c.y * 360}" r="12" fill="${colorHex}" stroke="#2a2a2a" stroke-width="2"/>
    `;
  }).join('');

  const svg = `
    <svg viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect x="4" y="4" width="352" height="352" rx="10" fill="white"/>
      ${circlesHtml}
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export default function UsabilityTest() {
  const nav = useNavigate();

  const totalQuestions = TESTS.length;
  const [qIndex, setQIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState("A");
  const [progress, setProgress] = useState({ painted: 0, total: 15 });

  const currentTest = TESTS[qIndex];
  const currentSeed = SEEDS[qIndex];

  const selected = useMemo(
    () => COLORS.find((c) => c.key === selectedKey) ?? COLORS[0],
    [selectedKey]
  );

  const questionText = useMemo(
    () => `Pregunta ${qIndex + 1}/${totalQuestions}`,
    [qIndex]
  );

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

  useEffect(() => {
    const onKeyDown = (e) => {
      const k = (e.key || "").toUpperCase();
      const valid = COLORS.some((c) => c.key === k);
      if (!valid) return;

      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      setSelectedKey(k);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const referenceImage = useMemo(
    () => generateReferenceImage(qIndex, currentSeed, 15),
    [qIndex, currentSeed]
  );

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

            <div className="utHintSmall">
              Selecciona con teclado: <strong>A</strong>–<strong>H</strong>
            </div>
          </section>

          {/* Dibujo */}
          <section className="utPanel utPanel--board">
            <h2 className="utTitle utTitle--italic">Dibujo a pintar</h2>

            <PaintBoard
              key={currentSeed}
              seed={currentSeed}
              circlesCount={15}
              selectedColor={selected.hex}
              onProgress={setProgress}
            />
          </section>

          {/* Referencia */}
          <section className="utPanel utPanel--ref">
            <h2 className="utTitle utTitle--italic">Referencia</h2>
            <img
              src={referenceImage}
              alt={`Referencia: ${currentTest.name}`}
              className="referenceImage"
            />
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
