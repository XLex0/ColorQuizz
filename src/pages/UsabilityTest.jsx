import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaintBoard from "../components/PaintBoard";
import "../styles/usability-test.css";

// Configuración de colores por tipo de daltonismo
const DEUTERANOMALY_COLORS = [
  { key: "A", hex: "#D62E1C" },  // Rojo oscuro (confunde con marrón)
  { key: "B", hex: "#D97706" },  // Naranja-marrón (confunde con rojo)
  { key: "C", hex: "#84CC16" },  // Verde-amarillo (confunde)
  { key: "D", hex: "#228B22" },  // Verde oscuro (confunde con marrón)
  { key: "E", hex: "#1E40AF" },  // Azul (distinguible)
  { key: "F", hex: "#64748B" },  // Gris azulado (neutral)
  { key: "G", hex: "#4B5563" },  // Gris oscuro (neutral)
  { key: "H", hex: "#2563EB" },  // Azul claro (distinguible)
];

const PROTANOMALY_PROTANOPIA_COLORS = [
  { key: "A", hex: "#DC2626" },  // Rojo puro (rojo > marrón)
  { key: "B", hex: "#EA580C" },  // Naranja (muy difícil de distinguir del rojo)
  { key: "C", hex: "#6B7280" },  // Gris oscuro (neutral)
  { key: "D", hex: "#22C55E" },  // Verde (confunde con amarillo)
  { key: "E", hex: "#3B82F6" },  // Azul (distinguible)
  { key: "F", hex: "#FBBF24" },  // Amarillo (confunde con rojo)
  { key: "G", hex: "#EF4444" },  // Rojo claro (similar al naranja)
  { key: "H", hex: "#60A5FA" },  // Azul claro (distinguible)
];

const TRITANOMALY_COLORS = [
  { key: "A", hex: "#2563EB" },  // Azul (confunde con rojo)
  { key: "B", hex: "#3B82F6" },  // Azul claro (confunde con amarillo)
  { key: "C", hex: "#FCD34D" },  // Amarillo (confunde con rosa/magenta)
  { key: "D", hex: "#EC4899" },  // Rosa (confunde con azul)
  { key: "E", hex: "#8B5CF6" },  // Morado (confunde con amarillo)
  { key: "F", hex: "#EF4444" },  // Rojo (confunde con azul)
  { key: "G", hex: "#64748B" },  // Gris (neutral)
  { key: "H", hex: "#10B981" },  // Verde (confunde con gris)
];

const TRITANOPIA_COLORS = [
  { key: "A", hex: "#1E3A8A" },  // Azul oscuro (confunde con rojo)
  { key: "B", hex: "#0369A1" },  // Azul cyan (similar)
  { key: "C", hex: "#F59E0B" },  // Amarillo oscuro (confunde con rosa)
  { key: "D", hex: "#D946EF" },  // Magenta (confunde con azul)
  { key: "E", hex: "#7C3AED" },  // Morado (confunde con rojo)
  { key: "F", hex: "#EF4444" },  // Rojo (confunde con azul)
  { key: "G", hex: "#94A3B8" },  // Gris (neutral)
  { key: "H", hex: "#14B8A6" },  // Verde agua (similar)
];

const SEEDS = [1024, 2048, 3072, 4096, 5120];

// Configuración de pruebas con colores específicos para cada tipo de daltonismo
const TESTS = [
  {
    id: 0,
    name: "Pregunta 1: Deuteranomalía",
    type: "deuteranomaly",
    colors: [
      { x: 0.22, y: 0.22, hex: "#D62E1C" },  // Rojo oscuro
      { x: 0.5, y: 0.22, hex: "#D97706" },   // Naranja-marrón
      { x: 0.78, y: 0.22, hex: "#84CC16" },  // Verde-amarillo
      { x: 0.22, y: 0.5, hex: "#228B22" },   // Verde oscuro
      { x: 0.5, y: 0.5, hex: "#1E40AF" },    // Azul
      { x: 0.78, y: 0.5, hex: "#64748B" },   // Gris azulado
      { x: 0.36, y: 0.78, hex: "#4B5563" },  // Gris oscuro
      { x: 0.64, y: 0.78, hex: "#2563EB" },  // Azul claro
    ]
  },
  {
    id: 1,
    name: "Pregunta 2: Protanomalía, Protanopia y Deuteranopia",
    type: "protanomaly_protanopia_deuteranopia",
    colors: [
      { x: 0.22, y: 0.22, hex: "#DC2626" },  // Rojo puro
      { x: 0.5, y: 0.22, hex: "#EA580C" },   // Naranja
      { x: 0.78, y: 0.22, hex: "#6B7280" },  // Gris oscuro
      { x: 0.22, y: 0.5, hex: "#22C55E" },   // Verde
      { x: 0.5, y: 0.5, hex: "#3B82F6" },    // Azul
      { x: 0.78, y: 0.5, hex: "#FBBF24" },   // Amarillo
      { x: 0.36, y: 0.78, hex: "#EF4444" },  // Rojo claro
      { x: 0.64, y: 0.78, hex: "#60A5FA" },  // Azul claro
    ]
  },
  {
    id: 2,
    name: "Pregunta 3: Tritanomalía",
    type: "tritanomaly",
    colors: [
      { x: 0.22, y: 0.22, hex: "#2563EB" },  // Azul
      { x: 0.5, y: 0.22, hex: "#3B82F6" },   // Azul claro
      { x: 0.78, y: 0.22, hex: "#FCD34D" },  // Amarillo
      { x: 0.22, y: 0.5, hex: "#EC4899" },   // Rosa
      { x: 0.5, y: 0.5, hex: "#8B5CF6" },    // Morado
      { x: 0.78, y: 0.5, hex: "#EF4444" },   // Rojo
      { x: 0.36, y: 0.78, hex: "#64748B" },  // Gris
      { x: 0.64, y: 0.78, hex: "#10B981" },  // Verde
    ]
  },
  {
    id: 3,
    name: "Pregunta 4: Tritanopia",
    type: "tritanopia",
    colors: [
      { x: 0.22, y: 0.22, hex: "#1E3A8A" },  // Azul oscuro
      { x: 0.5, y: 0.22, hex: "#0369A1" },   // Azul cyan
      { x: 0.78, y: 0.22, hex: "#F59E0B" },  // Amarillo oscuro
      { x: 0.22, y: 0.5, hex: "#D946EF" },   // Magenta
      { x: 0.5, y: 0.5, hex: "#7C3AED" },    // Morado
      { x: 0.78, y: 0.5, hex: "#EF4444" },   // Rojo
      { x: 0.36, y: 0.78, hex: "#94A3B8" },  // Gris
      { x: 0.64, y: 0.78, hex: "#14B8A6" },  // Verde agua
    ]
  },
  {
    id: 4,
    name: "Pregunta 5: Confirmación Final",
    type: "confirmation",
    colors: [
      { x: 0.22, y: 0.22, hex: "#DC2626" },  // Rojo
      { x: 0.5, y: 0.22, hex: "#EA580C" },   // Naranja
      { x: 0.78, y: 0.22, hex: "#22C55E" },  // Verde
      { x: 0.22, y: 0.5, hex: "#3B82F6" },   // Azul
      { x: 0.5, y: 0.5, hex: "#64748B" },    // Gris
      { x: 0.78, y: 0.5, hex: "#8B5CF6" },   // Morado
      { x: 0.36, y: 0.78, hex: "#EC4899" },  // Rosa
      { x: 0.64, y: 0.78, hex: "#FCD34D" },  // Amarillo
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
  const [selectedCircleIndex, setSelectedCircleIndex] = useState(null);
  const [progress, setProgress] = useState({ painted: 0, total: 15 });

  const currentTest = TESTS[qIndex];
  const currentSeed = SEEDS[qIndex];

  // Obtener los colores según el tipo de prueba
  const getColorsForTest = () => {
    switch (TESTS[qIndex].type) {
      case "deuteranomaly":
        return DEUTERANOMALY_COLORS;
      case "protanomaly_protanopia_deuteranopia":
        return PROTANOMALY_PROTANOPIA_COLORS;
      case "tritanomaly":
        return TRITANOMALY_COLORS;
      case "tritanopia":
        return TRITANOPIA_COLORS;
      default:
        return PROTANOMALY_PROTANOPIA_COLORS;
    }
  };

  const colorsForCurrentTest = getColorsForTest();

  const selected = useMemo(
    () => colorsForCurrentTest.find((c) => c.key === selectedKey) ?? colorsForCurrentTest[0],
    [selectedKey, qIndex]
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
      const key = e.key || "";
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      // Mapeo de teclas a índices de círculos
      const circleKeyMap = {
        "1": 0, "2": 1, "3": 2, "4": 3, "5": 4,
        "6": 5, "7": 6, "8": 7, "9": 8, "0": 9,
        "q": 10, "w": 11, "y": 12, "r": 13, "t": 14,
      };

      // Detectar teclas para seleccionar círculos
      if (key in circleKeyMap) {
        setSelectedCircleIndex(circleKeyMap[key]);
        e.preventDefault();
        return;
      }

      // Detectar letras A-H para seleccionar color
      const k = key.toUpperCase();
      const valid = colorsForCurrentTest.some((c) => c.key === k);
      if (valid) {
        setSelectedKey(k);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [colorsForCurrentTest]);

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
              {colorsForCurrentTest.map((c) => {
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
              Selecciona círculo: <strong>1-9, 0, q, w, y, r, t</strong> | Color: <strong>A–H</strong>
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
              selectedCircleIndex={selectedCircleIndex}
              onSelectCircle={setSelectedCircleIndex}
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
