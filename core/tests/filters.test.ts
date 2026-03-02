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
        quality: "major" as const,
        extensions: [],
        alterations: [],
      },
    };

    expect(computeAllowedPitchClasses(state)).toEqual([2, 7, 11]);
  });

  it("supports omit-tone behavior by excluding intervals", () => {
    const state = {
      ...createDefaultAppState(),
      chord: {
        rootPitchClass: 7 as const,
        quality: "major" as const,
        extensions: [],
        alterations: [],
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
        quality: "minor" as const,
        extensions: [],
        alterations: [],
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
        quality: "major" as const,
        extensions: [],
        alterations: [],
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
