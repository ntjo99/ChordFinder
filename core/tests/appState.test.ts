import { describe, expect, it } from "vitest";
import { createDefaultAppState } from "../src/appState";

describe("app state defaults", () => {
  it("starts with deterministic defaults", () => {
    expect(createDefaultAppState()).toEqual({
      noteNamingPolicy: "sharps",
      keyScale: null,
      chord: null,
      includeIntervals: [],
      excludeIntervals: [],
    });
  });
});
