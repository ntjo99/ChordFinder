import {
  computeAllowedPitchClasses,
  createFretboardCells,
  formatPitchClass,
  generateChordPitchClasses,
  MVP_MAX_FRET,
  MVP_MIN_FRET,
  type AppState,
  type FretboardCell,
  type PitchClass,
} from "@core";

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

const getRootPitchClass = (state: AppState): PitchClass | null => {
  if (state.chord) {
    return state.chord.rootPitchClass;
  }

  if (state.keyScale) {
    return state.keyScale.rootPitchClass;
  }

  return null;
};

export const deriveFretboardState = (state: AppState): DerivedFretboardState => {
  const allowedPitchClasses = computeAllowedPitchClasses(state);
  const chordPitchClasses = state.chord
    ? generateChordPitchClasses(state.chord.rootPitchClass, state.chord.quality, {
        extensions: state.chord.extensions,
        alterations: state.chord.alterations,
      })
    : [];

  return {
    cells: baseFretboardCells,
    minFret: MVP_MIN_FRET,
    maxFret: MVP_MAX_FRET,
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
  const rootSummary = `Root ${formatRootLabel(state)}`;

  return `${keySummary} | ${chordSummary} | ${rootSummary}`;
};
