import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaintBoard from "../components/PaintBoard";
import "../styles/usability-test.css";
import COLORS from "../json/colors.json";

const SEEDS = [1024, 2048, 3072, 4096, 5120, 6144];

const TESTS = [
  { id: 0, name: "Test 1: Rojo–Verde", jsonKey: "TEST1_RED_GREEN_COLORS" },
  {
    id: 1,
    name: "Test 2: Tritanomalía (Azul–Verde)",
    jsonKey: "TEST2_TRITANOMALY_BLUE_GREEN_COLORS",
  },
  {
    id: 2,
    name: "Test 3: Tritanomalía (Amarillo–Rojo)",
    jsonKey: "TEST3_TRITANOMALY_YELLOW_RED_COLORS",
  },
  {
    id: 3,
    name: "Test 4: Tritanopia (Azul–Verde)",
    jsonKey: "TEST4_TRITANOPIA_BLUE_GREEN_COLORS",
  },
  {
    id: 4,
    name: "Test 5: Tritanopia (Violeta–Rojo)",
    jsonKey: "TEST5_TRITANOPIA_VIOLET_RED_COLORS",
  },
  {
    id: 5,
    name: "Test 6: Tritanopia (Amarillo–Rosado)",
    jsonKey: "TEST6_TRITANOPIA_YELLOW_PINK_COLORS",
  },
];

const CIRCLES_COUNT = 20;
const CIRCLE_SCALE = 1.3;
const REF_BASE_RADIUS = 12;
const REF_RADIUS = Math.round(REF_BASE_RADIUS * CIRCLE_SCALE);

/** PRNG reproducible por seed (Mulberry32) */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
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


function buildAnswerKey(palette, seed, circlesCount) {
  const circles = generateCircles({ count: circlesCount, seed }); // mismo orden/seed
  const expected = {};
  for (let i = 0; i < circles.length; i++) {
    expected[String(i)] = palette[i % palette.length].key; // "0"-"9"
  }
  return { seed, circlesCount, expected };
}

function gradeTest(expected, answers, circlesCount) {
  let correct = 0, wrong = 0, unanswered = 0;

  for (let i = 0; i < circlesCount; i++) {
    const exp = expected[String(i)];
    const ans = answers[String(i)];
    if (ans == null) unanswered++;
    else if (ans === exp) correct++;
    else wrong++;
  }

  const attempted = correct + wrong;
  const accuracyAttempted = attempted > 0 ? (correct / attempted) * 100 : 0;
  const accuracyTotal = circlesCount > 0 ? (correct / circlesCount) * 100 : 0;

  return { correct, wrong, unanswered, attempted, accuracyAttempted, accuracyTotal };
}

function generateReferenceImage(palette, seed, circlesCount) {
  const circles = generateCircles({ count: circlesCount, seed });

  const circlesHtml = circles
    .map((c, idx) => {
      const colorHex = palette[idx % palette.length].hex;
      return `<circle cx="${c.x * 360}" cy="${c.y * 360}" r="${REF_RADIUS}" fill="${colorHex}" stroke="#2a2a2a" stroke-width="2"/>`;
    })
    .join("");

  const svg = `
    <svg viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect x="4" y="4" width="352" height="352" rx="10" fill="white"/>
      ${circlesHtml}
    </svg>
  `;

  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}

export default function UsabilityTest() {
  const nav = useNavigate();

  const totalQuestions = TESTS.length;

  const [qIndex, setQIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState("0");
  const [selectedCircleIndex, setSelectedCircleIndex] = useState(null);
  const [progress, setProgress] = useState({
    painted: 0,
    total: CIRCLES_COUNT,
  });

  const [answersByCircle, setAnswersByCircle] = useState({});
  const [results, setResults] = useState([]);

  const currentTest = TESTS[qIndex];
  const currentSeed = SEEDS[qIndex] ?? SEEDS[0];

  const colorsForCurrentTest = useMemo(() => {
    const palette = COLORS?.[currentTest.jsonKey];
    return Array.isArray(palette) && palette.length ? palette : [];
  }, [currentTest.jsonKey]);

  const selected = useMemo(() => {
    return (
      colorsForCurrentTest.find((c) => c.key === selectedKey) ??
      colorsForCurrentTest[0] ?? { key: "0", hex: "#000000" }
    );
  }, [selectedKey, colorsForCurrentTest]);

  const questionText = useMemo(
    () => `Pregunta ${qIndex + 1}/${totalQuestions}`,
    [qIndex, totalQuestions],
  );

 const answerKey = useMemo(() => {
  if (!colorsForCurrentTest.length) return null;
  return buildAnswerKey(colorsForCurrentTest, currentSeed, CIRCLES_COUNT);
}, [colorsForCurrentTest, currentSeed]);

  const referenceImage = useMemo(() => {
    if (!colorsForCurrentTest.length) return "";
    return generateReferenceImage(
      colorsForCurrentTest,
      currentSeed,
      CIRCLES_COUNT,
    );
  }, [colorsForCurrentTest, currentSeed]);

 {/*onst finalizeCurrentTest = () => {
    if (!answerKey) return null;

    const grade = gradeTest(answerKey.expected, answersByCircle, CIRCLES_COUNT);

    return {
      testId: currentTest.id,
      testName: currentTest.name,
      seed: currentSeed,
      circlesCount: CIRCLES_COUNT,
      ...grade,
    };
  };*/}

const goNext = () => {
  // resumen del test actual
  const summary = answerKey
    ? {
        testId: currentTest.id,
        testName: currentTest.name,
        seed: currentSeed,
        circlesCount: CIRCLES_COUNT,
        ...gradeTest(answerKey.expected, answersByCircle, CIRCLES_COUNT),
      }
    : null;

  const nextResults = summary ? [...results, summary] : results;
  if (summary) setResults(nextResults);

  if (qIndex < totalQuestions - 1) {
    setQIndex((p) => p + 1);
    setSelectedKey("0");
    setSelectedCircleIndex(null);
    setProgress({ painted: 0, total: CIRCLES_COUNT });
    setAnswersByCircle({});
  } else {

    nav("/results", { state: { results: nextResults } });
  }
};

  useEffect(() => {
    const onKeyDown = (e) => {
      const raw = e.key || "";
      const key = raw.toLowerCase();
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      const circleKeyMap = {
        q: 0,
        w: 1,
        e: 2,
        r: 3,
        t: 4,
        a: 5,
        s: 6,
        d: 7,
        f: 8,
        g: 9,
        z: 10,
        x: 11,
        c: 12,
        v: 13,
        b: 14,
        n: 15,
        m: 16,
        h: 17,
        j: 18,
        k: 19,
      };

      if (key in circleKeyMap) {
        setSelectedCircleIndex(circleKeyMap[key]);
        e.preventDefault();
        return;
      }

      // color 0-9
      if (/^[0-9]$/.test(raw)) {
        const valid = colorsForCurrentTest.some((c) => c.key === raw);
        if (valid) {
          setSelectedKey(raw);
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [colorsForCurrentTest]);

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

            <div
              className="utPaletteGrid"
              role="group"
              aria-label="Paleta de colores (0-9)"
            >
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
                    <span
                      className="utSwatchColor"
                      style={{ background: c.hex }}
                    />
                    <span className="utSwatchText">
                      <span className="utSwatchKey">{c.key}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="utHintSmall">
              Selecciona círculo:{" "}
              <strong>Q W E R T A S D F G Z X C V B N M H J K</strong> | Color:{" "}
              <strong>0–9</strong>
            </div>

            <div className="utHintSmall">
              Progreso: {progress.painted}/{progress.total}
            </div>
          </section>

          {/* Referencia */}
          <section className="utPanel utPanel--ref">
            <h2 className="utTitle utTitle--italic">Referencia</h2>
            {referenceImage ? (
              <img
                src={referenceImage}
                alt={`Referencia: ${currentTest.name}`}
                className="referenceImage"
              />
            ) : (
              <p style={{ padding: 12 }}>No se pudo cargar la referencia.</p>
            )}
          </section>

          {/* Dibujo */}
          <section className="utPanel utPanel--board">
            <h2 className="utTitle utTitle--italic">Dibujo a pintar</h2>

            <PaintBoard
              key={currentSeed}
              seed={currentSeed}
              circlesCount={CIRCLES_COUNT}
              circleScale={CIRCLE_SCALE}
              selectedColor={selected.hex}
              selectedColorKey={selected.key}
              selectedCircleIndex={selectedCircleIndex}
              onProgress={setProgress}
              onAnswersChange={setAnswersByCircle}
            />
          </section>
        </div>

        <footer className="utFooter">
          <div className="utQuestion">{questionText}</div>

          <button className="utNext" type="button" onClick={goNext}>
            {qIndex < totalQuestions - 1 ? "Siguiente  >" : "Finalizar  >"}
          </button>
        </footer>
      </main>
    </div>
  );
}
