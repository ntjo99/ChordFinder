import type { IntervalName } from "./intervals";
import { intervalToPitchClass } from "./intervals";
import { formatPitchClasses, type NoteNamingPolicy } from "./noteNaming";
import { uniquePitchClasses, type PitchClass } from "./pitchClass";

export type ChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "sus2"
  | "sus4"
  | "dominant7"
  | "major7"
  | "minor7";

export type ChordExtension = "6" | "b7" | "7" | "9" | "11" | "13";
export type ChordAlteration = "b9" | "#9" | "#11" | "b13";

export interface ChordOptions {
  extensions?: readonly ChordExtension[];
  alterations?: readonly ChordAlteration[];
}

const CHORD_QUALITY_INTERVALS: Readonly<
  Record<ChordQuality, readonly IntervalName[]>
> = {
  major: ["1", "3", "5"],
  minor: ["1", "b3", "5"],
  diminished: ["1", "b3", "b5"],
  augmented: ["1", "3", "#5"],
  sus2: ["1", "2", "5"],
  sus4: ["1", "4", "5"],
  dominant7: ["1", "3", "5", "b7"],
  major7: ["1", "3", "5", "7"],
  minor7: ["1", "b3", "5", "b7"],
};

const CHORD_EXTENSION_INTERVAL: Readonly<Record<ChordExtension, IntervalName>> = {
  "6": "6",
  b7: "b7",
  "7": "7",
  "9": "9",
  "11": "11",
  "13": "13",
};

const ALTERATION_REPLACEMENTS: Readonly<Record<ChordAlteration, IntervalName>> = {
  b9: "9",
  "#9": "9",
  "#11": "11",
  b13: "13",
};

const pushUnique = (target: IntervalName[], value: IntervalName): void => {
  if (!target.includes(value)) {
    target.push(value);
  }
};

export const getChordQualityIntervals = (
  quality: ChordQuality,
): readonly IntervalName[] => CHORD_QUALITY_INTERVALS[quality];

export const generateChordIntervals = (
  quality: ChordQuality,
  options: ChordOptions = {},
): IntervalName[] => {
  const intervals: IntervalName[] = [...getChordQualityIntervals(quality)];

  for (const extension of options.extensions ?? []) {
    pushUnique(intervals, CHORD_EXTENSION_INTERVAL[extension]);
  }

  for (const alteration of options.alterations ?? []) {
    const replacement = ALTERATION_REPLACEMENTS[alteration];
    const replacementIndex = intervals.indexOf(replacement);

    if (replacementIndex >= 0) {
      intervals.splice(replacementIndex, 1);
    }

    pushUnique(intervals, alteration);
  }

  return intervals;
};

export const generateChordPitchClasses = (
  rootPitchClass: PitchClass,
  quality: ChordQuality,
  options: ChordOptions = {},
): PitchClass[] => {
  const intervals = generateChordIntervals(quality, options);
  return uniquePitchClasses(
    intervals.map((interval) => intervalToPitchClass(rootPitchClass, interval)),
  );
};

export const generateChordNoteNames = (
  rootPitchClass: PitchClass,
  quality: ChordQuality,
  options: ChordOptions = {},
  noteNamingPolicy: NoteNamingPolicy = "sharps",
): string[] =>
  formatPitchClasses(
    generateChordPitchClasses(rootPitchClass, quality, options),
    noteNamingPolicy,
  );
