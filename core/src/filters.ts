import type { AppState } from "./appState";
import { resolveIntervalPitchClasses, type IntervalName } from "./intervals";
import { formatPitchClasses } from "./noteNaming";
import {
  ALL_PITCH_CLASSES,
  PITCH_CLASS_COUNT,
  uniqueSortedPitchClasses,
  type PitchClass,
} from "./pitchClass";
import { generateScalePitchClasses } from "./scales";

const intersectSet = (
  current: Set<PitchClass>,
  keepValues: readonly PitchClass[],
): void => {
  const keep = new Set<PitchClass>(keepValues);

  for (const pitchClass of current) {
    if (!keep.has(pitchClass)) {
      current.delete(pitchClass);
    }
  }
};

const subtractSet = (
  current: Set<PitchClass>,
  removeValues: readonly PitchClass[],
): void => {
  for (const pitchClass of removeValues) {
    current.delete(pitchClass);
  }
};

const getIntervalReferenceRoot = (state: AppState): PitchClass | null => {
  if (state.keyScale) {
    return state.keyScale.rootPitchClass;
  }

  if (state.chord) {
    return state.chord.rootPitchClass;
  }

  return null;
};

const getDisplayOrderRoot = (state: AppState): PitchClass | null => {
  if (state.chord) {
    return state.chord.rootPitchClass;
  }

  if (state.keyScale) {
    return state.keyScale.rootPitchClass;
  }

  return null;
};

const sortPitchClassesFromRoot = (
  pitchClasses: readonly PitchClass[],
  rootPitchClass: PitchClass | null,
): PitchClass[] => {
  if (rootPitchClass === null) {
    return [...pitchClasses];
  }

  return [...pitchClasses].sort((left, right) => {
    const leftOffset =
      (left - rootPitchClass + PITCH_CLASS_COUNT) % PITCH_CLASS_COUNT;
    const rightOffset =
      (right - rootPitchClass + PITCH_CLASS_COUNT) % PITCH_CLASS_COUNT;

    return leftOffset - rightOffset;
  });
};

const resolveIntervalFilterPitchClasses = (
  rootPitchClass: PitchClass,
  intervals: readonly IntervalName[],
): PitchClass[] => resolveIntervalPitchClasses(rootPitchClass, intervals);

export const computeAllowedPitchClasses = (state: AppState): PitchClass[] => {
  const allowed = new Set<PitchClass>(ALL_PITCH_CLASSES);

  if (state.keyScale) {
    const scalePitchClasses = generateScalePitchClasses(
      state.keyScale.rootPitchClass,
      state.keyScale.scaleType,
    );
    intersectSet(allowed, scalePitchClasses);
  }

  if (state.chord) {
    const chordPitchClasses = resolveIntervalFilterPitchClasses(
      state.chord.rootPitchClass,
      state.chord.intervals,
    );
    intersectSet(allowed, chordPitchClasses);
  }

  const intervalReferenceRoot = getIntervalReferenceRoot(state);

  if (intervalReferenceRoot !== null && state.includeIntervals.length > 0) {
    const includedPitchClasses = resolveIntervalFilterPitchClasses(
      intervalReferenceRoot,
      state.includeIntervals,
    );
    intersectSet(allowed, includedPitchClasses);
  }

  if (intervalReferenceRoot !== null && state.excludeIntervals.length > 0) {
    const excludedPitchClasses = resolveIntervalFilterPitchClasses(
      intervalReferenceRoot,
      state.excludeIntervals,
    );
    subtractSet(allowed, excludedPitchClasses);
  }

  return uniqueSortedPitchClasses(allowed);
};

export const computeAllowedNoteNames = (state: AppState): string[] => {
  const displayOrderedPitchClasses = sortPitchClassesFromRoot(
    computeAllowedPitchClasses(state),
    getDisplayOrderRoot(state),
  );

  return formatPitchClasses(displayOrderedPitchClasses, state.noteNamingPolicy);
};
