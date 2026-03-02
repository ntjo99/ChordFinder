import type { IntervalName } from "./intervals";
import { intervalToPitchClass } from "./intervals";
import { formatPitchClasses, type NoteNamingPolicy } from "./noteNaming";
import type { PitchClass } from "./pitchClass";

export type ScaleType = "major" | "naturalMinor";

const SCALE_INTERVALS: Readonly<Record<ScaleType, readonly IntervalName[]>> = {
  major: ["1", "2", "3", "4", "5", "6", "7"],
  naturalMinor: ["1", "2", "b3", "4", "5", "b6", "b7"],
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
