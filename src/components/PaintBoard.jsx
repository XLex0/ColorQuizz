import { useMemo, useState } from "react";

/** PRNG reproducible por seed (Mulberry32) */
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

export default function PaintBoard({
  seed = 1,
  circlesCount = 15,
  selectedColor,
  onProgress,
}) {
  const circles = useMemo(
    () => generateCircles({ count: circlesCount, seed }),
    [circlesCount, seed]
  );

  const [fills, setFills] = useState({});

  const paint = (id) => {
    setFills((prev) => {
      const next = { ...prev, [id]: selectedColor };
      onProgress?.({ painted: Object.keys(next).length, total: circlesCount });
      return next;
    });
  };

  return (
    <div className="cbBoard">
      <svg className="cbSvg" viewBox="0 0 360 360" preserveAspectRatio="none">
        <rect x="4" y="4" width="352" height="352" rx="10" fill="white" />
        {circles.map((c) => {
          const cx = c.x * 360;
          const cy = c.y * 360;

          return (
            <circle
              key={c.id}
              cx={cx}
              cy={cy}
              r={12}
              fill={fills[c.id] ?? "#FFFFFF"}
              stroke="#2a2a2a"
              strokeWidth="2"
              className="cbCircle"
              onClick={() => paint(c.id)}
            />
          );
        })}
      </svg>
    </div>
  );
}
