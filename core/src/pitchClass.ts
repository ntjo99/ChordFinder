export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const PITCH_CLASS_COUNT = 12;

export const ALL_PITCH_CLASSES: readonly PitchClass[] = Object.freeze([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
]);

export const isPitchClass = (value: number): value is PitchClass =>
  Number.isInteger(value) && value >= 0 && value < PITCH_CLASS_COUNT;

export const toPitchClass = (value: number): PitchClass => {
  const normalized =
    ((value % PITCH_CLASS_COUNT) + PITCH_CLASS_COUNT) % PITCH_CLASS_COUNT;
  return normalized as PitchClass;
};

export const transposePitchClass = (
  root: PitchClass,
  semitoneOffset: number,
): PitchClass => toPitchClass(root + semitoneOffset);

export const uniquePitchClasses = (values: Iterable<number>): PitchClass[] => {
  const seen = new Set<PitchClass>();
  for (const value of values) {
    seen.add(toPitchClass(value));
  }

  return [...seen];
};

export const uniqueSortedPitchClasses = (
  values: Iterable<number>,
): PitchClass[] => uniquePitchClasses(values).sort((a, b) => a - b);
