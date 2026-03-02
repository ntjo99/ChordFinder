import {
  ALL_PITCH_CLASSES,
  MVP_MAX_FRET,
  MVP_MIN_FRET,
  STANDARD_TUNING_PITCH_CLASSES,
  createDefaultAppState,
  type AppState,
  type ChordExtension,
  type ChordQuality,
  type IntervalName,
  type ScaleType,
} from "@core";

export interface ViewFilterState {
  minFret: number;
  maxFret: number;
  enabledStringIndices: readonly number[];
}

export const SCALE_OPTIONS: readonly ScaleType[] = Object.freeze([
  "major",
  "naturalMinor",
]);

export const CHORD_QUALITY_OPTIONS: readonly ChordQuality[] = Object.freeze([
  "major",
  "minor",
  "diminished",
  "augmented",
  "sus2",
  "sus4",
  "dominant7",
  "major7",
  "minor7",
]);

export const CHORD_EXTENSION_OPTIONS: readonly ChordExtension[] = Object.freeze([
  "6",
  "7",
  "9",
  "11",
  "13",
]);

export const INTERVAL_OPTIONS: readonly IntervalName[] = Object.freeze([
  "1",
  "b2",
  "2",
  "b3",
  "3",
  "4",
  "b5",
  "5",
  "#5",
  "6",
  "b7",
  "7",
  "9",
  "11",
  "13",
  "b9",
  "#9",
  "#11",
  "b13",
]);

export const FRET_OPTIONS: readonly number[] = Object.freeze(
  Array.from({ length: MVP_MAX_FRET - MVP_MIN_FRET + 1 }, (_, index) => index),
);

export const ALL_PITCH_CLASS_OPTIONS = ALL_PITCH_CLASSES;
export const STANDARD_TUNING = STANDARD_TUNING_PITCH_CLASSES;

export const createInitialAppState = (): AppState => ({
  ...createDefaultAppState(),
  keyScale: {
    rootPitchClass: 0,
    scaleType: "major",
  },
});

export const createInitialViewFilterState = (): ViewFilterState => ({
  minFret: MVP_MIN_FRET,
  maxFret: MVP_MAX_FRET,
  enabledStringIndices: [0, 1, 2, 3, 4, 5],
});
