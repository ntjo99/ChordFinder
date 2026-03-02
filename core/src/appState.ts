import type { IntervalName } from "./intervals";
import type { NoteNamingPolicy } from "./noteNaming";
import type { PitchClass } from "./pitchClass";
import type { ScaleType } from "./scales";

export interface KeyScaleFilter {
  rootPitchClass: PitchClass;
  scaleType: ScaleType;
}

export interface ChordFilter {
  rootPitchClass: PitchClass;
  intervals: readonly IntervalName[];
}

export interface AppState {
  noteNamingPolicy: NoteNamingPolicy;
  keyScale: KeyScaleFilter | null;
  chord: ChordFilter | null;
  includeIntervals: readonly IntervalName[];
  excludeIntervals: readonly IntervalName[];
}

export const createDefaultAppState = (): AppState => ({
  noteNamingPolicy: "sharps",
  keyScale: null,
  chord: null,
  includeIntervals: [],
  excludeIntervals: [],
});
