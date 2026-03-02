import { describe, expect, it } from "vitest";
import {
  intervalToPitchClass,
  intervalToSemitones,
  parseIntervalName,
  resolveIntervalPitchClasses,
} from "../src/intervals";

describe("interval utilities", () => {
  it("maps interval names to semitone distances", () => {
    expect(intervalToSemitones("1")).toBe(0);
    expect(intervalToSemitones("b9")).toBe(13);
    expect(intervalToSemitones("#11")).toBe(18);
    expect(intervalToSemitones("13")).toBe(21);
  });

  it("parses aliases and invalid intervals", () => {
    expect(parseIntervalName("8")).toBe("1");
    expect(parseIntervalName("#2")).toBe("b3");
    expect(parseIntervalName("#4")).toBe("b5");
    expect(parseIntervalName("")).toBeNull();
    expect(parseIntervalName("not-an-interval")).toBeNull();
  });

  it("resolves interval pitch classes relative to a root", () => {
    expect(intervalToPitchClass(0, "b9")).toBe(1);
    expect(resolveIntervalPitchClasses(7, ["1", "3", "5", "13"])).toEqual([
      7, 11, 2, 4,
    ]);
  });
});
