import { describe, expect, it } from "vitest";
import {
  createFretboardCells,
  MVP_MAX_FRET,
  MVP_MIN_FRET,
  STANDARD_TUNING_PITCH_CLASSES,
} from "../src/fretboardModel";

describe("fretboardModel", () => {
  it("creates standard tuning cells including open strings from fret 0 through 17", () => {
    const cells = createFretboardCells();
    const fretCount = MVP_MAX_FRET - MVP_MIN_FRET + 1;

    expect(cells).toHaveLength(STANDARD_TUNING_PITCH_CLASSES.length * fretCount);
    expect(cells[0]).toEqual({ stringIndex: 0, fret: 0, pitchClass: 4 });
    expect(cells[17]).toEqual({ stringIndex: 0, fret: 17, pitchClass: 9 });
    expect(cells[18]).toEqual({ stringIndex: 1, fret: 0, pitchClass: 9 });
  });

  it("repeats pitch classes every 12 frets for each string", () => {
    const cells = createFretboardCells();
    const fretsPerString = MVP_MAX_FRET - MVP_MIN_FRET + 1;
    const stringOffset = fretsPerString * 5;
    const openLowE = cells[0]!;
    const octaveLowE = cells[12]!;
    const openHighE = cells[stringOffset]!;
    const octaveHighE = cells[stringOffset + 12]!;

    expect(openLowE.pitchClass).toBe(octaveLowE.pitchClass);
    expect(openHighE.pitchClass).toBe(octaveHighE.pitchClass);
  });

  it("supports custom ranges for future fret-window behavior", () => {
    const cells = createFretboardCells({ minFret: 5, maxFret: 7 });

    expect(cells).toHaveLength(6 * 3);
    expect(cells[0]).toEqual({ stringIndex: 0, fret: 5, pitchClass: 9 });
    expect(cells[2]).toEqual({ stringIndex: 0, fret: 7, pitchClass: 11 });
  });
});
