import { describe, expect, it } from "vitest";
import {
  generateScaleNoteNames,
  generateScalePitchClasses,
  getScaleIntervals,
} from "../src/scales";

describe("scales", () => {
  it("generates C major pitch classes in scale order", () => {
    expect(generateScalePitchClasses(0, "major")).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(getScaleIntervals("major")).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
  });

  it("generates A natural minor pitch classes in scale order", () => {
    expect(generateScalePitchClasses(9, "naturalMinor")).toEqual([9, 11, 0, 2, 4, 5, 7]);
    expect(getScaleIntervals("naturalMinor")).toEqual([
      "1",
      "2",
      "b3",
      "4",
      "5",
      "b6",
      "b7",
    ]);
  });

  it("generates D dorian pitch classes in scale order", () => {
    expect(generateScalePitchClasses(2, "dorian")).toEqual([2, 4, 5, 7, 9, 11, 0]);
    expect(getScaleIntervals("dorian")).toEqual([
      "1",
      "2",
      "b3",
      "4",
      "5",
      "6",
      "b7",
    ]);
  });

  it("generates mode families with deterministic intervals", () => {
    expect(getScaleIntervals("phrygian")).toEqual([
      "1",
      "b2",
      "b3",
      "4",
      "5",
      "b6",
      "b7",
    ]);
    expect(getScaleIntervals("lydian")).toEqual([
      "1",
      "2",
      "3",
      "b5",
      "5",
      "6",
      "7",
    ]);
    expect(getScaleIntervals("mixolydian")).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "b7",
    ]);
    expect(getScaleIntervals("locrian")).toEqual([
      "1",
      "b2",
      "b3",
      "4",
      "b5",
      "b6",
      "b7",
    ]);
  });

  it("supports pentatonic and blues families", () => {
    expect(getScaleIntervals("majorPentatonic")).toEqual([
      "1",
      "2",
      "3",
      "5",
      "6",
    ]);
    expect(getScaleIntervals("minorPentatonic")).toEqual([
      "1",
      "b3",
      "4",
      "5",
      "b7",
    ]);
    expect(getScaleIntervals("minorBlues")).toEqual([
      "1",
      "b3",
      "4",
      "b5",
      "5",
      "b7",
    ]);
    expect(generateScalePitchClasses(0, "majorPentatonic")).toEqual([0, 2, 4, 7, 9]);
    expect(generateScalePitchClasses(9, "minorPentatonic")).toEqual([9, 0, 2, 4, 7]);
    expect(generateScalePitchClasses(9, "minorBlues")).toEqual([9, 0, 2, 3, 4, 7]);
  });

  it("supports harmonic and melodic minor scales", () => {
    expect(getScaleIntervals("harmonicMinor")).toEqual([
      "1",
      "2",
      "b3",
      "4",
      "5",
      "b6",
      "7",
    ]);
    expect(getScaleIntervals("melodicMinor")).toEqual([
      "1",
      "2",
      "b3",
      "4",
      "5",
      "6",
      "7",
    ]);
    expect(generateScalePitchClasses(9, "harmonicMinor")).toEqual([
      9,
      11,
      0,
      2,
      4,
      5,
      8,
    ]);
    expect(generateScalePitchClasses(9, "melodicMinor")).toEqual([
      9,
      11,
      0,
      2,
      4,
      6,
      8,
    ]);
  });

  it("supports major blues", () => {
    expect(getScaleIntervals("majorBlues")).toEqual([
      "1",
      "2",
      "b3",
      "3",
      "5",
      "6",
    ]);
    expect(generateScalePitchClasses(0, "majorBlues")).toEqual([0, 2, 3, 4, 7, 9]);
  });

  it("formats scale names using the selected naming policy", () => {
    expect(generateScaleNoteNames(1, "major")).toEqual([
      "C#",
      "D#",
      "F",
      "F#",
      "G#",
      "A#",
      "C",
    ]);
    expect(generateScaleNoteNames(1, "major", "flats")).toEqual([
      "Db",
      "Eb",
      "F",
      "Gb",
      "Ab",
      "Bb",
      "C",
    ]);
  });
});
