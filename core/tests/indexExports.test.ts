import { describe, expect, it } from "vitest";
import {
  computeAllowedPitchClasses,
  createDefaultAppState,
  formatPitchClass,
  generateScalePitchClasses,
  toPitchClass,
} from "../src";

describe("index exports", () => {
  it("re-exports primary API surface from barrel", () => {
    const defaultState = createDefaultAppState();
    expect(computeAllowedPitchClasses(defaultState)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
    expect(generateScalePitchClasses(0, "major")).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(formatPitchClass(toPitchClass(13), "flats")).toBe("Db");
  });
});
