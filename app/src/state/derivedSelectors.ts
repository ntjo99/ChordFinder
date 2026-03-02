import {
  computeAllowedPitchClasses,
  createFretboardCells,
  formatPitchClass,
  generateChordPitchClasses,
  type AppState,
  type FretboardCell,
  type PitchClass,
} from "@core";
import type { ViewFilterState } from "./appStateStore";

export interface DerivedFretboardState {
  cells: readonly FretboardCell[];
  minFret: number;
  maxFret: number;
  hasChord: boolean;
  allowedPitchClasses: ReadonlySet<PitchClass>;
  chordPitchClasses: ReadonlySet<PitchClass>;
  rootPitchClass: PitchClass | null;
  noteNamingPolicy: AppState["noteNamingPolicy"];
}

const baseFretboardCells = Object.freeze(createFretboardCells());
const DEFAULT_STRING_INDICES = Object.freeze([0, 1, 2, 3, 4, 5]);

const getRootPitchClass = (state: AppState): PitchClass | null => {
  if (state.chord) {
    return state.chord.rootPitchClass;
  }

  if (state.keyScale) {
    return state.keyScale.rootPitchClass;
  }

  return null;
};

const normalizeEnabledStringIndices = (
  value: readonly number[],
): number[] => {
  const normalized = [...new Set(value)]
    .filter((index) => index >= 0 && index < DEFAULT_STRING_INDICES.length)
    .sort((left, right) => left - right);

  return normalized.length > 0 ? normalized : [0];
};

const mapCellStringIndices = (
  cells: readonly FretboardCell[],
  enabledStringIndices: readonly number[],
): FretboardCell[] => {
  const indexMap = new Map<number, number>();
  enabledStringIndices.forEach((stringIndex, displayIndex) => {
    indexMap.set(stringIndex, displayIndex);
  });

  return cells.map((cell) => ({
    ...cell,
    stringIndex: indexMap.get(cell.stringIndex) ?? cell.stringIndex,
  }));
};

export const deriveFretboardState = (
  state: AppState,
  viewState: ViewFilterState,
): DerivedFretboardState => {
  const allowedPitchClasses = computeAllowedPitchClasses(state);
  const chordPitchClasses = state.chord
    ? generateChordPitchClasses(state.chord.rootPitchClass, state.chord.quality, {
        extensions: state.chord.extensions,
        alterations: state.chord.alterations,
      })
    : [];
  const enabledStringIndices = normalizeEnabledStringIndices(
    viewState.enabledStringIndices,
  );
  const enabledStringSet = new Set(enabledStringIndices);
  const filteredCells = baseFretboardCells.filter(
    (cell) =>
      enabledStringSet.has(cell.stringIndex) &&
      cell.fret >= viewState.minFret &&
      cell.fret <= viewState.maxFret,
  );
  const cells = mapCellStringIndices(filteredCells, enabledStringIndices);

  return {
    cells,
    minFret: viewState.minFret,
    maxFret: viewState.maxFret,
    hasChord: state.chord !== null,
    allowedPitchClasses: new Set(allowedPitchClasses),
    chordPitchClasses: new Set(chordPitchClasses),
    rootPitchClass: getRootPitchClass(state),
    noteNamingPolicy: state.noteNamingPolicy,
  };
};

const formatRootLabel = (state: AppState): string => {
  if (state.chord) {
    return formatPitchClass(state.chord.rootPitchClass, state.noteNamingPolicy);
  }

  if (state.keyScale) {
    return formatPitchClass(state.keyScale.rootPitchClass, state.noteNamingPolicy);
  }

  return "None";
};

export const buildStateSummary = (state: AppState): string => {
  const keySummary = state.keyScale
    ? `${formatPitchClass(
        state.keyScale.rootPitchClass,
        state.noteNamingPolicy,
      )} ${state.keyScale.scaleType}`
    : "No key";
  const chordSummary = state.chord
    ? `${formatPitchClass(state.chord.rootPitchClass, state.noteNamingPolicy)} ${
        state.chord.quality
      }`
    : "No chord";
  const excludeSummary =
    state.excludeIntervals.length > 0
      ? `Omit ${state.excludeIntervals.join(", ")}`
      : "Omit none";
  const rootSummary = `Root ${formatRootLabel(state)}`;

  return `${keySummary} | ${chordSummary} | ${excludeSummary} | ${rootSummary}`;
};
