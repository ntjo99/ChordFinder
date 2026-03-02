import type { IntervalName } from "./intervals";
import { intervalToPitchClass } from "./intervals";
import { formatPitchClasses, type NoteNamingPolicy } from "./noteNaming";
import type { PitchClass } from "./pitchClass";

export type ScaleType =
  | "major"
  | "naturalMinor"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "locrian"
  | "harmonicMinor"
  | "melodicMinor"
  | "majorPentatonic"
  | "minorPentatonic"
  | "minorBlues"
  | "majorBlues";

const SCALE_INTERVALS: Readonly<Record<ScaleType, readonly IntervalName[]>> = {
  major: ["1", "2", "3", "4", "5", "6", "7"],
  naturalMinor: ["1", "2", "b3", "4", "5", "b6", "b7"],
  dorian: ["1", "2", "b3", "4", "5", "6", "b7"],
  phrygian: ["1", "b2", "b3", "4", "5", "b6", "b7"],
  lydian: ["1", "2", "3", "b5", "5", "6", "7"],
  mixolydian: ["1", "2", "3", "4", "5", "6", "b7"],
  locrian: ["1", "b2", "b3", "4", "b5", "b6", "b7"],
  harmonicMinor: ["1", "2", "b3", "4", "5", "b6", "7"],
  melodicMinor: ["1", "2", "b3", "4", "5", "6", "7"],
  majorPentatonic: ["1", "2", "3", "5", "6"],
  minorPentatonic: ["1", "b3", "4", "5", "b7"],
  minorBlues: ["1", "b3", "4", "b5", "5", "b7"],
  majorBlues: ["1", "2", "b3", "3", "5", "6"],
};

export const getScaleIntervals = (scaleType: ScaleType): readonly IntervalName[] =>
  SCALE_INTERVALS[scaleType];

export const generateScalePitchClasses = (
  rootPitchClass: PitchClass,
  scaleType: ScaleType,
): PitchClass[] =>
  getScaleIntervals(scaleType).map((interval) =>
    intervalToPitchClass(rootPitchClass, interval),
  );

export const generateScaleNoteNames = (
  rootPitchClass: PitchClass,
  scaleType: ScaleType,
  noteNamingPolicy: NoteNamingPolicy = "sharps",
): string[] =>
  formatPitchClasses(
    generateScalePitchClasses(rootPitchClass, scaleType),
    noteNamingPolicy,
  );
