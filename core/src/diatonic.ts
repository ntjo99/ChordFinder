import type { ChordQuality } from "./chords";
import { generateChordPitchClasses } from "./chords";
import type { PitchClass } from "./pitchClass";
import { generateScalePitchClasses, type ScaleType } from "./scales";

export interface DiatonicChordOption {
  rootPitchClass: PitchClass;
  quality: ChordQuality;
}

const DIATONIC_QUALITY_CANDIDATES: readonly ChordQuality[] = Object.freeze([
  "major",
  "minor",
  "diminished",
  "sus2",
  "sus4",
  "major7",
  "minor7",
  "dominant7",
]);

const getScalePitchClassSet = (
  keyRoot: PitchClass,
  scaleType: ScaleType,
): ReadonlySet<PitchClass> =>
  new Set(generateScalePitchClasses(keyRoot, scaleType));

const isSubset = (
  source: readonly PitchClass[],
  target: ReadonlySet<PitchClass>,
): boolean => source.every((pitchClass) => target.has(pitchClass));

export const getDiatonicChordOptions = (
  keyRoot: PitchClass,
  scaleType: ScaleType,
): DiatonicChordOption[] => {
  const scalePitchClasses = generateScalePitchClasses(keyRoot, scaleType);
  const scaleSet = getScalePitchClassSet(keyRoot, scaleType);
  const options: DiatonicChordOption[] = [];

  for (const rootPitchClass of scalePitchClasses) {
    for (const quality of DIATONIC_QUALITY_CANDIDATES) {
      const chordPitchClasses = generateChordPitchClasses(rootPitchClass, quality);
      if (!isSubset(chordPitchClasses, scaleSet)) {
        continue;
      }

      options.push({
        rootPitchClass,
        quality,
      });
    }
  }

  return options;
};

export const getDiatonicChordRoots = (
  keyRoot: PitchClass,
  scaleType: ScaleType,
): PitchClass[] => generateScalePitchClasses(keyRoot, scaleType);

export const getDiatonicChordQualitiesForRoot = (
  keyRoot: PitchClass,
  scaleType: ScaleType,
  chordRoot: PitchClass,
): ChordQuality[] =>
  getDiatonicChordOptions(keyRoot, scaleType)
    .filter((option) => option.rootPitchClass === chordRoot)
    .map((option) => option.quality);
