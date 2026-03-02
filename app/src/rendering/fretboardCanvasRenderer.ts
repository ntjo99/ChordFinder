import { formatPitchClass, type FretboardCell, type PitchClass } from "@core";
import { computeLayoutMetrics, type CanvasSize } from "./layoutMetrics";

export interface FretboardRenderData {
  cells: readonly FretboardCell[];
  minFret: number;
  maxFret: number;
  hasChord: boolean;
  allowedPitchClasses: ReadonlySet<PitchClass>;
  chordPitchClasses: ReadonlySet<PitchClass>;
  rootPitchClass: PitchClass | null;
  noteNamingPolicy: "sharps" | "flats";
}

const INLAY_FRETS = new Set([3, 5, 7, 9, 12, 15, 17]);
const MARKER_LABEL_FRETS = new Set([3, 5, 7, 9, 12, 15, 17]);

type ToneRole = "root" | "chord" | "allowed" | "muted" | "idle";

const classifyToneRole = (
  pitchClass: PitchClass,
  renderData: FretboardRenderData,
): ToneRole => {
  const isAllowed = renderData.allowedPitchClasses.has(pitchClass);
  const isRoot = renderData.rootPitchClass !== null && pitchClass === renderData.rootPitchClass;

  if (isAllowed && isRoot) {
    return "root";
  }

  if (isAllowed && renderData.hasChord && renderData.chordPitchClasses.has(pitchClass)) {
    return "chord";
  }

  if (isAllowed) {
    return "allowed";
  }

  if (renderData.hasChord) {
    return "muted";
  }

  return "idle";
};

const drawBoard = (
  ctx: CanvasRenderingContext2D,
  layout: ReturnType<typeof computeLayoutMetrics>,
): void => {
  const boardWidth = layout.boardRight - layout.boardLeft;
  const boardHeight = layout.boardBottom - layout.boardTop;

  const background = ctx.createLinearGradient(0, layout.boardTop, 0, layout.boardBottom);
  background.addColorStop(0, "rgba(28, 36, 52, 0.95)");
  background.addColorStop(1, "rgba(12, 18, 28, 0.95)");
  ctx.fillStyle = background;
  ctx.fillRect(layout.boardLeft, layout.boardTop, boardWidth, boardHeight);
};

const drawHeadstock = (
  ctx: CanvasRenderingContext2D,
  layout: ReturnType<typeof computeLayoutMetrics>,
): void => {
  const headstockTop = layout.boardTop - layout.stringSpacing * 0.48;
  const headstockBottom = layout.boardBottom + layout.stringSpacing * 0.48;
  const headstockLeft = layout.headstockLeft;
  const headstockRight = layout.headstockRight;
  const headstockWidth = headstockRight - headstockLeft;
  const neckJoinX = headstockRight + 4;

  const fill = ctx.createLinearGradient(headstockLeft, 0, neckJoinX, 0);
  fill.addColorStop(0, "rgba(140, 156, 186, 0.14)");
  fill.addColorStop(1, "rgba(140, 156, 186, 0.05)");

  ctx.fillStyle = fill;
  ctx.strokeStyle = "rgba(184, 198, 224, 0.26)";
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(neckJoinX, headstockTop + 5);
  ctx.quadraticCurveTo(
    headstockLeft + headstockWidth * 0.62,
    headstockTop - 7,
    headstockLeft,
    headstockTop + 18,
  );
  ctx.lineTo(headstockLeft, headstockBottom - 18);
  ctx.quadraticCurveTo(
    headstockLeft + headstockWidth * 0.62,
    headstockBottom + 7,
    neckJoinX,
    headstockBottom - 5,
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  for (let stringIndex = 0; stringIndex < layout.stringCount; stringIndex += 1) {
    const y = layout.boardTop + stringIndex * layout.stringSpacing;
    const pinX = headstockLeft + headstockWidth * 0.36;

    ctx.fillStyle = "rgba(196, 209, 231, 0.18)";
    ctx.strokeStyle = "rgba(220, 231, 248, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pinX, y, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
};

const drawFrets = (
  ctx: CanvasRenderingContext2D,
  layout: ReturnType<typeof computeLayoutMetrics>,
): void => {
  for (let fret = 0; fret <= layout.fretCount; fret += 1) {
    const x = layout.boardLeft + fret * layout.fretSpacing;
    const lineWidth = fret === 0 ? 4 : 1;

    ctx.strokeStyle = fret === 0 ? "rgba(196, 208, 230, 0.85)" : "rgba(149, 163, 188, 0.35)";
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x, layout.boardTop);
    ctx.lineTo(x, layout.boardBottom);
    ctx.stroke();
  }
};

const drawStrings = (
  ctx: CanvasRenderingContext2D,
  layout: ReturnType<typeof computeLayoutMetrics>,
): void => {
  const stringStartX = layout.headstockLeft + layout.headstockWidth * 0.1;

  for (let stringIndex = 0; stringIndex < layout.stringCount; stringIndex += 1) {
    const y = layout.boardTop + stringIndex * layout.stringSpacing;
    const widthWeight = 1 + ((layout.stringCount - stringIndex) / layout.stringCount) * 1.9;

    ctx.strokeStyle = "rgba(228, 235, 248, 0.42)";
    ctx.lineWidth = widthWeight;
    ctx.beginPath();
    ctx.moveTo(stringStartX, y);
    ctx.lineTo(layout.boardRight, y);
    ctx.stroke();
  }
};

const drawInlays = (
  ctx: CanvasRenderingContext2D,
  layout: ReturnType<typeof computeLayoutMetrics>,
  minFret: number,
  maxFret: number,
): void => {
  for (let fret = minFret; fret <= maxFret; fret += 1) {
    if (!INLAY_FRETS.has(fret)) {
      continue;
    }

    const x = layout.boardLeft + (fret + 0.5 - minFret) * layout.fretSpacing;
    const midY = (layout.boardTop + layout.boardBottom) / 2;
    ctx.fillStyle = "rgba(140, 154, 182, 0.35)";

    if (fret === 12) {
      ctx.beginPath();
      ctx.arc(x, layout.boardTop + (layout.boardBottom - layout.boardTop) * 0.35, 5.5, 0, Math.PI * 2);
      ctx.arc(x, layout.boardTop + (layout.boardBottom - layout.boardTop) * 0.65, 5.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, midY, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

const drawFretLabels = (
  ctx: CanvasRenderingContext2D,
  layout: ReturnType<typeof computeLayoutMetrics>,
  minFret: number,
  maxFret: number,
): void => {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.max(10, layout.noteRadius * 0.8)}px "Segoe UI", sans-serif`;

  for (let fret = minFret; fret <= maxFret; fret += 1) {
    if (!MARKER_LABEL_FRETS.has(fret)) {
      continue;
    }

    const x = layout.boardLeft + (fret + 0.5 - minFret) * layout.fretSpacing;
    const y = layout.markerLabelY;
    ctx.fillStyle = "rgba(190, 203, 227, 0.9)";
    ctx.fillText(String(fret), x, y);
  }
};

const getToneStyle = (
  toneRole: ToneRole,
): { fill: string; stroke: string; text: string; radiusScale: number } => {
  switch (toneRole) {
    case "root":
      return {
        fill: "#ff8a45",
        stroke: "#ffe3c8",
        text: "#1a120a",
        radiusScale: 1.14,
      };
    case "chord":
      return {
        fill: "#18c3ff",
        stroke: "#bbf0ff",
        text: "#031018",
        radiusScale: 1.02,
      };
    case "allowed":
      return {
        fill: "#6f9dff",
        stroke: "#d6e3ff",
        text: "#07111f",
        radiusScale: 0.96,
      };
    case "muted":
      return {
        fill: "rgba(100, 109, 128, 0.56)",
        stroke: "rgba(170, 180, 200, 0.38)",
        text: "rgba(220, 227, 239, 0.72)",
        radiusScale: 0.84,
      };
    default:
      return {
        fill: "rgba(90, 101, 122, 0.18)",
        stroke: "rgba(147, 160, 183, 0.2)",
        text: "rgba(188, 198, 217, 0.35)",
        radiusScale: 0.75,
      };
  }
};

const getOpenNoteTextColor = (toneRole: ToneRole, defaultColor: string): string => {
  if (toneRole === "allowed" || toneRole === "chord" || toneRole === "root") {
    return "rgba(235, 244, 255, 0.96)";
  }

  return defaultColor;
};

const drawNotes = (
  ctx: CanvasRenderingContext2D,
  layout: ReturnType<typeof computeLayoutMetrics>,
  renderData: FretboardRenderData,
): void => {
  const minFret = renderData.minFret;
  const fontSize = Math.max(10, layout.noteRadius * 0.82);
  const openBadgeSize = Math.max(8, layout.noteRadius * 0.56);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const cell of renderData.cells) {
    const toneRole = classifyToneRole(cell.pitchClass, renderData);
    const style = getToneStyle(toneRole);
    const centerX = layout.boardLeft + (cell.fret + 0.5 - minFret) * layout.fretSpacing;
    const centerY = layout.boardTop + cell.stringIndex * layout.stringSpacing;
    const radius = layout.noteRadius * style.radiusScale;
    const isOpen = cell.fret === 0;

    if (isOpen) {
      ctx.fillStyle = "rgba(8, 12, 20, 0.82)";
      ctx.strokeStyle = style.fill;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.68, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = `700 ${openBadgeSize}px "Segoe UI", sans-serif`;
      ctx.fillStyle = "rgba(224, 234, 249, 0.9)";
      ctx.fillText("O", centerX, centerY - radius - openBadgeSize * 0.65);
    } else {
      ctx.fillStyle = style.fill;
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.font = `600 ${fontSize}px "Segoe UI", sans-serif`;
    ctx.fillStyle = isOpen ? getOpenNoteTextColor(toneRole, style.text) : style.text;
    ctx.fillText(
      formatPitchClass(cell.pitchClass, renderData.noteNamingPolicy),
      centerX,
      centerY,
    );
  }
};

export const renderFretboardCanvas = (
  ctx: CanvasRenderingContext2D,
  canvasSize: CanvasSize,
  renderData: FretboardRenderData,
): void => {
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
  const stringCount = Math.max(...renderData.cells.map((cell) => cell.stringIndex)) + 1;
  const fretCount = renderData.maxFret - renderData.minFret + 1;
  const layout = computeLayoutMetrics(canvasSize, fretCount, stringCount);

  drawBoard(ctx, layout);
  drawHeadstock(ctx, layout);
  drawFrets(ctx, layout);
  drawInlays(ctx, layout, renderData.minFret, renderData.maxFret);
  drawStrings(ctx, layout);
  drawNotes(ctx, layout, renderData);
  drawFretLabels(ctx, layout, renderData.minFret, renderData.maxFret);
};
