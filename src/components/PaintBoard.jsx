import { useMemo, useState, useEffect } from "react";

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

/**
 * ✅ Teclas para hasta 20 círculos
 * (solo letras, para no chocar con 0–9 que usas en la paleta)
 */
const CIRCLE_KEYS = [
  "q",
  "w",
  "e",
  "r",
  "t",
  "a",
  "s",
  "d",
  "f",
  "g",
  "z",
  "x",
  "c",
  "v",
  "b",
  "n",
  "m",
  "h",
  "j",
  "k",
];

function getKeyForCircleIndex(idx) {
  return CIRCLE_KEYS[idx] || "?";
}

export default function PaintBoard({
  seed = 1,
  circlesCount = 15,
  circleScale = 1, // ✅ nuevo prop (ej: 1.3)
  selectedColor,
  selectedColorKey,
  selectedCircleIndex,
  onProgress,
  onAnswersChange,
}) {
  const circles = useMemo(
    () => generateCircles({ count: circlesCount, seed }),
    [circlesCount, seed],
  );

  const [fills, setFills] = useState({});

  // ✅ radio escalable
  const BASE_R = 12;
  const R = BASE_R * (circleScale ?? 1);

  /** Pintar un círculo por ID */
  const paint = (idx) => {
    if (!selectedColor || !selectedColorKey) return;
    const id = circles[idx]?.id;
    if (!id) return;

    setFills((prev) => {
      const prevKey = prev[id]?.key;
      if (prevKey === selectedColorKey) return prev;

      const next = {
        ...prev,
        [id]: { hex: selectedColor, key: selectedColorKey, idx },
      };

      onProgress?.({
        painted: Object.keys(next).length,
        total: circlesCount,
      });

      const answers = {};
      Object.values(next).forEach((v) => {
        answers[v.idx] = v.key;
      });
      onAnswersChange?.(answers);

      return next;
    });
  };

  /**
   * ✅ EFECTO CORRECTO:
   * Pinta cuando cambia el círculo seleccionado o el color
   * (NO durante el render)
   */
  useEffect(() => {
    if (
      selectedCircleIndex == null ||
      !selectedColor ||
      !circles[selectedCircleIndex]
    ) {
      return;
    }

    paint(selectedCircleIndex);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCircleIndex, selectedColor, selectedColorKey, circles]);

  useEffect(() => {
    setFills({});
    onProgress?.({ painted: 0, total: circlesCount });
    onAnswersChange?.({}); // ✅
  }, [seed, circlesCount, onProgress, onAnswersChange]);

  return (
    <div className="cbBoard">
      <svg className="cbSvg" viewBox="0 0 360 360" preserveAspectRatio="none">
        <rect x="4" y="4" width="352" height="352" rx="10" fill="white" />

        {circles.map((c, idx) => {
          const cx = c.x * 360;
          const cy = c.y * 360;
          const isFilled = !!fills[c.id];
          const isSelected = selectedCircleIndex === idx;
          const displayKey = getKeyForCircleIndex(idx);

          return (
            <g key={c.id}>
              <circle
                cx={cx}
                cy={cy}
                r={R}
                fill={fills[c.id]?.hex ?? "#FFFFFF"} // ✅ FIX: ahora sí es un color
                stroke={isSelected ? "#000000" : "#2a2a2a"}
                strokeWidth={isSelected ? "3" : "2"}
                className="cbCircle"
                onClick={() => paint(idx)}
              />

              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(9, 9 * (circleScale ?? 1))} // ✅ ajusta texto
                fontWeight="bold"
                fill={isFilled ? "#FFFFFF" : "#2a2a2a"}
                pointerEvents="none"
                style={{ userSelect: "none" }}
              >
                {displayKey}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
