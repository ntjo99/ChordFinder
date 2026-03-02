export interface CanvasSize {
  width: number;
  height: number;
}

export interface LayoutMetrics {
  headstockLeft: number;
  headstockRight: number;
  headstockWidth: number;
  boardLeft: number;
  boardRight: number;
  boardTop: number;
  boardBottom: number;
  fretCount: number;
  stringCount: number;
  fretSpacing: number;
  stringSpacing: number;
  noteRadius: number;
  markerLabelY: number;
}

export const computeLayoutMetrics = (
  canvasSize: CanvasSize,
  fretCount: number,
  stringCount: number,
): LayoutMetrics => {
  const horizontalPadding = Math.max(24, canvasSize.width * 0.035);
  const verticalPadding = Math.max(28, canvasSize.height * 0.19);
  const markerGutter = Math.max(18, canvasSize.height * 0.1);
  const headstockWidth = Math.max(44, canvasSize.width * 0.075);
  const headstockLeft = horizontalPadding;
  const headstockRight = headstockLeft + headstockWidth;
  const boardLeft = headstockRight + 8;
  const boardRight = canvasSize.width - horizontalPadding;
  const boardTop = verticalPadding;
  const boardBottom = canvasSize.height - verticalPadding - markerGutter;
  const boardWidth = boardRight - boardLeft;
  const boardHeight = boardBottom - boardTop;
  const fretSpacing = boardWidth / fretCount;
  const stringSpacing = boardHeight / (stringCount - 1);
  const noteRadius = Math.max(9, Math.min(fretSpacing, stringSpacing) * 0.28);
  const markerLabelY = boardBottom + markerGutter * 0.62;

  return {
    headstockLeft,
    headstockRight,
    headstockWidth,
    boardLeft,
    boardRight,
    boardTop,
    boardBottom,
    fretCount,
    stringCount,
    fretSpacing,
    stringSpacing,
    noteRadius,
    markerLabelY,
  };
};
