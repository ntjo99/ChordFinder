import type { PitchClass } from "./pitchClass";

export type NoteNamingPolicy = "sharps" | "flats";

export const SHARP_NOTE_NAMES: readonly string[] = Object.freeze([
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
]);

export const FLAT_NOTE_NAMES: readonly string[] = Object.freeze([
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
]);

const NOTE_NAME_TO_PITCH_CLASS: Readonly<Record<string, PitchClass>> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  "E#": 5,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  Cb: 11,
  "B#": 0,
};

const normalizeNoteName = (rawNoteName: string): string => {
  const trimmed = rawNoteName.trim();
  if (!trimmed) {
    return "";
  }

  const letter = trimmed[0].toUpperCase();
  const accidental = trimmed
    .slice(1)
    .replaceAll("♯", "#")
    .replaceAll("♭", "b");

  return `${letter}${accidental}`;
};

export const parseNoteName = (noteName: string): PitchClass | null => {
  const normalized = normalizeNoteName(noteName);
  return NOTE_NAME_TO_PITCH_CLASS[normalized] ?? null;
};

export const formatPitchClass = (
  pitchClass: PitchClass,
  policy: NoteNamingPolicy = "sharps",
): string =>
  policy === "flats"
    ? FLAT_NOTE_NAMES[pitchClass]!
    : SHARP_NOTE_NAMES[pitchClass]!;

export const formatPitchClasses = (
  pitchClasses: readonly PitchClass[],
  policy: NoteNamingPolicy = "sharps",
): string[] => pitchClasses.map((pitchClass) => formatPitchClass(pitchClass, policy));
