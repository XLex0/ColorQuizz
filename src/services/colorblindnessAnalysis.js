/**
 * Análisis de daltonismo basado en píxeles pintados
 */

export const COLORBLINDNESS_TYPES = {
  RED_GREEN: "red_green", // Protanopia/Deuteranopia
  BLUE_YELLOW: "blue_yellow", // Tritanopia
};

/**
 * Simula cómo ve una persona con daltonismo rojo-verde
 */
function simulateRedGreenColorblindness(r, g, b) {
  // Protanopia (falta de fotorreceptores rojo)
  const l = 0.3 * r + 0.622 * g + 0.078 * b;
  const m = 0.23 * r + 0.692 * g + 0.078 * b;
  const s = 0.0037930732 * r + 0.0037930732 * g + 0.3592957807 * b;

  return {
    r: Math.round(Math.max(0, Math.min(255, -0.5767 * l + 1.1197 * m - 0.5643 * s))),
    g: Math.round(Math.max(0, Math.min(255, 0.184 * l - 0.1201 * m + 0.2059 * s))),
    b: Math.round(Math.max(0, Math.min(255, -0.0497 * l - 0.1957 * m + 1.1134 * s))),
  };
}

/**
 * Simula cómo ve una persona con daltonismo amarillo-azul
 */
function simulateBlueYellowColorblindness(r, g, b) {
  // Tritanopia (falta de fotorreceptores azul)
  const l = 0.3 * r + 0.622 * g + 0.078 * b;
  const m = 0.23 * r + 0.692 * g + 0.078 * b;
  const s = 0.0037930732 * r + 0.0037930732 * g + 0.3592957807 * b;

  return {
    r: Math.round(Math.max(0, Math.min(255, 0.1273 * l + 0.8733 * m - 0.0961 * s))),
    g: Math.round(Math.max(0, Math.min(255, -0.0155 * l + 0.1458 * m + 0.8567 * s))),
    b: Math.round(Math.max(0, Math.min(255, -0.3673 * l - 0.3673 * m + 1.0328 * s))),
  };
}

/**
 * Calcula la diferencia de color (Delta E simplificado)
 */
function calculateColorDifference(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );
}

/**
 * Analiza los píxeles pintados
 */
export function analyzeColorblindness(paintedPixels, testType) {
  if (!paintedPixels || paintedPixels.length === 0) {
    return {
      success: false,
      message: "No se pintó ninguna área",
      correctCount: 0,
      totalCount: 0,
      accuracy: 0,
    };
  }

  const simulationFn =
    testType === COLORBLINDNESS_TYPES.RED_GREEN
      ? simulateRedGreenColorblindness
      : simulateBlueYellowColorblindness;

  let correctCount = 0;

  paintedPixels.forEach((pixel) => {
    const { r, g, b } = pixel;
    const simulated = simulationFn(r, g, b);
    const colorDifference = calculateColorDifference(r, g, b, simulated.r, simulated.g, simulated.b);

    if (colorDifference > 30) {
      correctCount++;
    }
  });

  const accuracy = (correctCount / paintedPixels.length) * 100;

  return {
    success: accuracy > 50,
    message:
      accuracy > 50
        ? "Visión de color normal detectada"
        : "Posible daltonismo detectado",
    correctCount,
    totalCount: paintedPixels.length,
    accuracy: Math.round(accuracy),
    details: {
      type: testType,
      description:
        testType === COLORBLINDNESS_TYPES.RED_GREEN
          ? "Prueba de daltonismo rojo-verde"
          : "Prueba de daltonismo amarillo-azul",
    },
  };
}

/**
 * Obtiene recomendaciones basadas en el resultado
 */
export function getRecommendations(analysisResult) {
  if (analysisResult.success) {
    return [
      "✓ Tu visión de color parece normal",
      "Puedes distinguir correctamente los colores en esta prueba",
    ];
  } else {
    return [
      "⚠ Posible daltonismo detectado",
      "Te recomendamos realizar pruebas adicionales con un oftalmólogo",
      "Existen herramientas de accesibilidad disponibles",
    ];
  }
}
