import { describe, expect, it } from "vitest";
import {
  ALL_PITCH_CLASSES,
  PITCH_CLASS_COUNT,
  isPitchClass,
  toPitchClass,
  transposePitchClass,
  uniquePitchClasses,
  uniqueSortedPitchClasses,
} from "../src/pitchClass";

describe("pitch class utilities", () => {
  it("normalizes values to 0..11", () => {
    expect(toPitchClass(-1)).toBe(11);
    expect(toPitchClass(12)).toBe(0);
    expect(toPitchClass(25)).toBe(1);
    expect(PITCH_CLASS_COUNT).toBe(12);
  });

  it("validates pitch-class integers only", () => {
    expect(isPitchClass(0)).toBe(true);
    expect(isPitchClass(11)).toBe(true);
    expect(isPitchClass(-1)).toBe(false);
    expect(isPitchClass(12)).toBe(false);
    expect(isPitchClass(3.5)).toBe(false);
  });

  it("transposes and deduplicates pitch classes", () => {
    expect(transposePitchClass(11, 2)).toBe(1);
    expect(uniquePitchClasses([0, 12, -12, 1, 13])).toEqual([0, 1]);
    expect(uniqueSortedPitchClasses([7, 2, 14, 2, -10])).toEqual([2, 7]);
    expect(ALL_PITCH_CLASSES).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});
