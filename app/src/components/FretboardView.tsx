import { useEffect, useRef } from "react";
import { renderFretboardCanvas } from "../rendering/fretboardCanvasRenderer";
import type { DerivedFretboardState } from "../state/derivedSelectors";

interface FretboardViewProps {
  state: DerivedFretboardState;
}

const redrawCanvas = (
  canvas: HTMLCanvasElement,
  state: DerivedFretboardState,
): void => {
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  renderFretboardCanvas(
    context,
    {
      width: rect.width,
      height: rect.height,
    },
    state,
  );
};

export function FretboardView({ state }: FretboardViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const host = canvas.parentElement;
    if (!host) {
      return;
    }

    const draw = () => redrawCanvas(canvas, state);
    draw();

    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(host);
    window.addEventListener("resize", draw);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [state]);

  return <canvas ref={canvasRef} className="fretboard-canvas" aria-label="Guitar fretboard" />;
}
