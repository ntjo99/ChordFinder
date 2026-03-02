import { describe, expect, it } from "vitest";
import {
  getDiatonicChordOptions,
  getDiatonicChordQualitiesForRoot,
  getDiatonicChordRoots,
} from "../src/diatonic";

describe("diatonic chord helpers", () => {
  it("returns scale-degree roots for C major in scale order", () => {
    expect(getDiatonicChordRoots(0, "major")).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it("returns expected diatonic qualities for C major roots", () => {
    expect(getDiatonicChordQualitiesForRoot(0, "major", 0)).toEqual([
      "major",
      "sus2",
      "sus4",
      "major7",
    ]);
    expect(getDiatonicChordQualitiesForRoot(0, "major", 2)).toEqual([
      "minor",
      "sus2",
      "sus4",
      "minor7",
    ]);
    expect(getDiatonicChordQualitiesForRoot(0, "major", 7)).toEqual([
      "major",
      "sus2",
      "sus4",
      "dominant7",
    ]);
    expect(getDiatonicChordQualitiesForRoot(0, "major", 11)).toEqual([
      "diminished",
    ]);
  });

  it("returns only options whose pitch classes belong to the key/scale", () => {
    const options = getDiatonicChordOptions(9, "naturalMinor");
    expect(options).toContainEqual({ rootPitchClass: 9, quality: "minor" });
    expect(options).toContainEqual({ rootPitchClass: 0, quality: "major" });
    expect(options).toContainEqual({ rootPitchClass: 7, quality: "dominant7" });
    expect(options).not.toContainEqual({ rootPitchClass: 4, quality: "major" });
    expect(options).not.toContainEqual({ rootPitchClass: 11, quality: "major7" });
  });
});
