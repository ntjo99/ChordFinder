import {
  ALL_PITCH_CLASSES,
  MVP_MAX_FRET,
  MVP_MIN_FRET,
  type PitchClass,
  STANDARD_TUNING_PITCH_CLASSES,
  createDefaultAppState,
  type AppState,
  type ScaleType,
} from "@core";
import type { BaseChordQuality } from "./chordBuilder";

export interface ViewFilterState {
  minFret: number;
  maxFret: number;
  enabledStringIndices: readonly number[];
  showUnselectedNotes: boolean;
  tuningPresetId: TuningPresetId;
  stringPitchClasses: readonly PitchClass[];
}

export type TuningPresetId =
  | "standard"
  | "dropD"
  | "dStandard"
  | "openG"
  | "openD"
  | "custom";

export const SCALE_OPTIONS: readonly ScaleType[] = Object.freeze([
  "major",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "naturalMinor",
  "locrian",
  "harmonicMinor",
  "majorPentatonic",
  "minorPentatonic",
  "minorBlues",
  "majorBlues",
  "melodicMinor",
]);

export const CHORD_QUALITY_OPTIONS: readonly BaseChordQuality[] = Object.freeze([
  "major",
  "minor",
  "diminished",
  "augmented",
  "sus2",
  "sus4",
]);

export const FRET_OPTIONS: readonly number[] = Object.freeze(
  Array.from({ length: MVP_MAX_FRET - MVP_MIN_FRET + 1 }, (_, index) => index),
);

export const ALL_PITCH_CLASS_OPTIONS = ALL_PITCH_CLASSES;
export const STANDARD_TUNING = STANDARD_TUNING_PITCH_CLASSES;

export interface TuningPreset {
  id: Exclude<TuningPresetId, "custom">;
  label: string;
  stringPitchClasses: readonly PitchClass[];
}

export const TUNING_PRESETS: readonly TuningPreset[] = Object.freeze([
  {
    id: "standard",
    label: "Standard (E A D G B E)",
    stringPitchClasses: [4, 9, 2, 7, 11, 4],
  },
  {
    id: "dropD",
    label: "Drop D (D A D G B E)",
    stringPitchClasses: [2, 9, 2, 7, 11, 4],
  },
  {
    id: "dStandard",
    label: "D Standard (D G C F A D)",
    stringPitchClasses: [2, 7, 0, 5, 9, 2],
  },
  {
    id: "openG",
    label: "Open G (D G D G B D)",
    stringPitchClasses: [2, 7, 2, 7, 11, 2],
  },
  {
    id: "openD",
    label: "Open D (D A D F# A D)",
    stringPitchClasses: [2, 9, 2, 6, 9, 2],
  },
]);

export const resolveTuningPreset = (
  tuningPresetId: TuningPresetId,
): TuningPreset | null =>
  TUNING_PRESETS.find((preset) => preset.id === tuningPresetId) ?? null;

export const createInitialAppState = (): AppState => ({
  ...createDefaultAppState(),
  keyScale: {
    rootPitchClass: 0,
    scaleType: "major",
  },
});

export const createInitialViewFilterState = (): ViewFilterState => ({
  minFret: MVP_MIN_FRET,
  maxFret: 15,
  enabledStringIndices: [0, 1, 2, 3, 4, 5],
  showUnselectedNotes: false,
  tuningPresetId: "standard",
  stringPitchClasses: STANDARD_TUNING_PITCH_CLASSES,
});
