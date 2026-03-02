import { describe, expect, it } from "vitest";
import {
  FLAT_NOTE_NAMES,
  SHARP_NOTE_NAMES,
  formatPitchClass,
  formatPitchClasses,
  parseNoteName,
} from "../src/noteNaming";

describe("note naming", () => {
  it("formats pitch classes using sharp and flat policies", () => {
    expect(formatPitchClass(10, "sharps")).toBe("A#");
    expect(formatPitchClass(10, "flats")).toBe("Bb");
    expect(formatPitchClasses([0, 1, 10], "flats")).toEqual(["C", "Db", "Bb"]);
  });

  it("parses canonical and enharmonic note names", () => {
    expect(parseNoteName("C")).toBe(0);
    expect(parseNoteName("Db")).toBe(1);
    expect(parseNoteName("C#")).toBe(1);
    expect(parseNoteName("B#")).toBe(0);
    expect(parseNoteName("Fb")).toBe(4);
    expect(parseNoteName("g♯")).toBe(8);
    expect(parseNoteName("Bb")).toBe(10);
  });

  it("returns null for invalid names and exports full name maps", () => {
    expect(parseNoteName("")).toBeNull();
    expect(parseNoteName("H")).toBeNull();
    expect(SHARP_NOTE_NAMES).toHaveLength(12);
    expect(FLAT_NOTE_NAMES).toHaveLength(12);
  });
});
