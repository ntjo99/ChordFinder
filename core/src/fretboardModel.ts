import {
  transposePitchClass,
  type PitchClass,
} from "./pitchClass";

export const STANDARD_TUNING_PITCH_CLASSES: readonly PitchClass[] = Object.freeze([
  4, 9, 2, 7, 11, 4,
]);

export const MVP_MIN_FRET = 0;
export const MVP_MAX_FRET = 22;

export interface FretboardCell {
  stringIndex: number;
  fret: number;
  pitchClass: PitchClass;
}

export interface FretboardModelOptions {
  stringPitchClasses?: readonly PitchClass[];
  minFret?: number;
  maxFret?: number;
}

export const createFretboardCells = (
  options: FretboardModelOptions = {},
): FretboardCell[] => {
  const stringPitchClasses =
    options.stringPitchClasses ?? STANDARD_TUNING_PITCH_CLASSES;
  const minFret = options.minFret ?? MVP_MIN_FRET;
  const maxFret = options.maxFret ?? MVP_MAX_FRET;
  const cells: FretboardCell[] = [];

  for (let stringIndex = 0; stringIndex < stringPitchClasses.length; stringIndex += 1) {
    const openPitchClass = stringPitchClasses[stringIndex]!;

    for (let fret = minFret; fret <= maxFret; fret += 1) {
      cells.push({
        stringIndex,
        fret,
        pitchClass: transposePitchClass(openPitchClass, fret),
      });
    }
  }

  return cells;
};
