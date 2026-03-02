import {
  transposePitchClass,
  uniquePitchClasses,
  type PitchClass,
} from "./pitchClass";

export type IntervalName =
  | "1"
  | "b2"
  | "2"
  | "b3"
  | "3"
  | "4"
  | "b5"
  | "5"
  | "#5"
  | "b6"
  | "6"
  | "b7"
  | "7"
  | "9"
  | "11"
  | "13"
  | "b9"
  | "#9"
  | "#11"
  | "b13";

const INTERVAL_TO_SEMITONES: Readonly<Record<IntervalName, number>> = {
  "1": 0,
  b2: 1,
  "2": 2,
  b3: 3,
  "3": 4,
  "4": 5,
  b5: 6,
  "5": 7,
  "#5": 8,
  b6: 8,
  "6": 9,
  b7: 10,
  "7": 11,
  "9": 14,
  "11": 17,
  "13": 21,
  b9: 13,
  "#9": 15,
  "#11": 18,
  b13: 20,
};

const INTERVAL_ALIASES: Readonly<Record<string, IntervalName>> = {
  "8": "1",
  "#2": "b3",
  "#4": "b5",
};

export const parseIntervalName = (rawInterval: string): IntervalName | null => {
  const normalized = rawInterval.trim();

  if (!normalized) {
    return null;
  }

  if (normalized in INTERVAL_TO_SEMITONES) {
    return normalized as IntervalName;
  }

  return INTERVAL_ALIASES[normalized] ?? null;
};

export const intervalToSemitones = (interval: IntervalName): number =>
  INTERVAL_TO_SEMITONES[interval];

export const intervalToPitchClass = (
  rootPitchClass: PitchClass,
  interval: IntervalName,
): PitchClass => transposePitchClass(rootPitchClass, intervalToSemitones(interval));

export const resolveIntervalPitchClasses = (
  rootPitchClass: PitchClass,
  intervals: readonly IntervalName[],
): PitchClass[] =>
  uniquePitchClasses(intervals.map((interval) => intervalToPitchClass(rootPitchClass, interval)));
