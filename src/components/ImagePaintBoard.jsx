import { useRef, useState, useEffect } from "react";

export default function ImagePaintBoard({
  referenceImage,
  blankImage,
  selectedColor,
  brushSize = 8,
  onAnalysisReady,
}) {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Inicializar canvas con imagen en blanco
  useEffect(() => {
    if (!blankImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      setCtx(context);
      setImageLoaded(true);
    };

    img.src = blankImage;
  }, [blankImage]);

  const startDrawing = (e) => {
    if (!imageLoaded || !ctx) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = selectedColor;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const resetCanvas = () => {
    if (!ctx || !blankImage) return;

    const canvas = canvasRef.current;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = blankImage;
  };

  const analyzeImage = () => {
    if (!ctx) return;

    const canvas = canvasRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const paintedPixels = [];
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Si el píxel tiene color significativo
      if (a > 200 && (r > 50 || g > 50 || b > 50)) {
        paintedPixels.push({ r, g, b, index: i / 4 });
      }
    }

    onAnalysisReady?.({
      canvas: canvas.toDataURL(),
      paintedPixels,
      imageData,
    });
  };

  return (
    <div className="imagePaintBoard">
      <div className="imagePaintBoard__controls">
        {imageLoaded && (
          <>
            <button
              type="button"
              onClick={resetCanvas}
              className="imagePaintBoard__btn"
            >
              🔄 Limpiar
            </button>

            <button
              type="button"
              onClick={analyzeImage}
              className="imagePaintBoard__btn imagePaintBoard__btn--primary"
            >
              📊 Analizar
            </button>
          </>
        )}
      </div>

      {imageLoaded && (
        <canvas
          ref={canvasRef}
          className="imagePaintBoard__canvas"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseLeave={stopDrawing}
          style={{ cursor: "crosshair", maxWidth: "100%", height: "auto" }}
        />
      )}

      {!imageLoaded && (
        <div className="imagePaintBoard__placeholder">
          <p>Cargando imagen...</p>
        </div>
      )}
    </div>
  );
}
