import { describe, expect, it } from "vitest";
import { createDefaultAppState } from "../src/appState";
import { computeAllowedNoteNames, computeAllowedPitchClasses } from "../src/filters";

describe("computeAllowedPitchClasses", () => {
  it("intersects scale and chord tones deterministically", () => {
    const state = {
      ...createDefaultAppState(),
      keyScale: {
        rootPitchClass: 0 as const,
        scaleType: "major" as const,
      },
      chord: {
        rootPitchClass: 7 as const,
        intervals: ["1", "3", "5"] as const,
      },
    };

    expect(computeAllowedPitchClasses(state)).toEqual([2, 7, 11]);
  });

  it("supports omit-tone behavior by excluding intervals", () => {
    const state = {
      ...createDefaultAppState(),
      chord: {
        rootPitchClass: 7 as const,
        intervals: ["1", "3", "5"] as const,
      },
      excludeIntervals: ["3"] as const,
    };

    expect(computeAllowedPitchClasses(state)).toEqual([2, 7]);
  });

  it("interprets interval chips relative to key root when a key is active", () => {
    const state = {
      ...createDefaultAppState(),
      keyScale: {
        rootPitchClass: 0 as const,
        scaleType: "major" as const,
      },
      chord: {
        rootPitchClass: 4 as const,
        intervals: ["1", "b3", "5"] as const,
      },
      includeIntervals: ["3"] as const,
    };

    expect(computeAllowedPitchClasses(state)).toEqual([4]);
  });

  it("defaults to sharp naming unless the user selects flats", () => {
    const sharpsState = {
      ...createDefaultAppState(),
      chord: {
        rootPitchClass: 10 as const,
        intervals: ["1", "3", "5"] as const,
      },
    };

    const flatsState = {
      ...sharpsState,
      noteNamingPolicy: "flats" as const,
    };

    expect(computeAllowedNoteNames(sharpsState)).toEqual(["D", "F", "A#"]);
    expect(computeAllowedNoteNames(flatsState)).toEqual(["D", "F", "Bb"]);
  });
});
