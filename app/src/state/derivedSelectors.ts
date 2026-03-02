import {
  computeAllowedPitchClasses,
  createFretboardCells,
  formatPitchClass,
  resolveIntervalPitchClasses,
  type AppState,
  type FretboardCell,
  type PitchClass,
} from "@core";
import { type ViewFilterState } from "./appStateStore";
import { resolveChordDisplay } from "./chordBuilder";

export interface DerivedFretboardState {
  cells: readonly FretboardCell[];
  minFret: number;
  maxFret: number;
  showUnselectedNotes: boolean;
  hasChord: boolean;
  allowedPitchClasses: ReadonlySet<PitchClass>;
  chordPitchClasses: ReadonlySet<PitchClass>;
  rootPitchClass: PitchClass | null;
  noteNamingPolicy: AppState["noteNamingPolicy"];
}

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
  stringCount: number,
): number[] => {
  const normalized = [...new Set(value)]
    .filter((index) => index >= 0 && index < stringCount)
    .sort((left, right) => left - right);

  return normalized.length > 0 ? normalized : [0];
};

const mapCellStringIndices = (
  cells: readonly FretboardCell[],
  enabledStringIndices: readonly number[],
): FretboardCell[] => {
  const indexMap = new Map<number, number>();
  const lastDisplayIndex = enabledStringIndices.length - 1;
  enabledStringIndices.forEach((stringIndex, displayIndex) => {
    indexMap.set(stringIndex, lastDisplayIndex - displayIndex);
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
    ? resolveIntervalPitchClasses(state.chord.rootPitchClass, state.chord.intervals)
    : [];
  const baseFretboardCells = createFretboardCells({
    stringPitchClasses: viewState.stringPitchClasses,
  });
  const enabledStringIndices = normalizeEnabledStringIndices(
    viewState.enabledStringIndices,
    viewState.stringPitchClasses.length,
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
    showUnselectedNotes: viewState.showUnselectedNotes,
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
    ? (() => {
        const root = formatPitchClass(
          state.chord.rootPitchClass,
          state.noteNamingPolicy,
        );
        return resolveChordDisplay(root, state.chord.intervals).label;
      })()
    : "No chord";
  const excludeSummary =
    state.excludeIntervals.length > 0
      ? `Omit ${state.excludeIntervals.join(", ")}`
      : "Omit none";
  const rootSummary = `Root ${formatRootLabel(state)}`;

  return `${keySummary} | ${chordSummary} | ${excludeSummary} | ${rootSummary}`;
};
