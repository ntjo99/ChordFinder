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
