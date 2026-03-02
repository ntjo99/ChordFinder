import { describe, expect, it } from "vitest";
import {
  generateChordIntervals,
  generateChordNoteNames,
  generateChordPitchClasses,
} from "../src/chords";

describe("chords", () => {
  it("generates major and minor triads", () => {
    expect(generateChordPitchClasses(7, "major")).toEqual([7, 11, 2]);
    expect(generateChordPitchClasses(7, "minor")).toEqual([7, 10, 2]);
  });

  it("supports common extensions up to 13", () => {
    expect(
      generateChordIntervals("dominant7", {
        extensions: ["9", "11", "13"],
      }),
    ).toEqual(["1", "3", "5", "b7", "9", "11", "13"]);

    expect(
      generateChordPitchClasses(0, "dominant7", {
        extensions: ["9", "11", "13"],
      }),
    ).toEqual([0, 4, 7, 10, 2, 5, 9]);
  });

  it("replaces matching natural extensions when alterations are applied", () => {
    expect(
      generateChordIntervals("major", {
        extensions: ["9", "11", "13"],
        alterations: ["b9", "#11", "b13"],
      }),
    ).toEqual(["1", "3", "5", "b9", "#11", "b13"]);
  });

  it("formats chord notes in sharps by default and flats on demand", () => {
    expect(generateChordNoteNames(10, "major")).toEqual(["A#", "D", "F"]);
    expect(generateChordNoteNames(10, "major", {}, "flats")).toEqual([
      "Bb",
      "D",
      "F",
    ]);
  });
});
