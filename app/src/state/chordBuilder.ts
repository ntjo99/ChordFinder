import type { IntervalName } from "@core";

export type BaseChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "sus2"
  | "sus4";

export type ChordPresetId =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "six"
  | "seven"
  | "maj7"
  | "add9"
  | "add11"
  | "sus2"
  | "sus4";

export const CHORD_INTERVAL_SELECTOR_OPTIONS: readonly IntervalName[] = Object.freeze([
  "1",
  "b2",
  "2",
  "b3",
  "3",
  "4",
  "b5",
  "5",
  "#5",
  "6",
  "b7",
  "7",
]);

const BASE_QUALITY_INTERVALS: Readonly<Record<BaseChordQuality, readonly IntervalName[]>> = {
  major: ["1", "3", "5"],
  minor: ["1", "b3", "5"],
  diminished: ["1", "b3", "b5"],
  augmented: ["1", "3", "#5"],
  sus2: ["1", "2", "5"],
  sus4: ["1", "4", "5"],
};

const NON_CORE_ADDON_INTERVALS = new Set<IntervalName>(["6", "b7", "7"]);

const CHORD_PRESET_INTERVALS: Readonly<Record<ChordPresetId, readonly IntervalName[]>> =
  Object.freeze({
    major: ["1", "3", "5"],
    minor: ["1", "b3", "5"],
    diminished: ["1", "b3", "b5"],
    augmented: ["1", "3", "#5"],
    six: ["1", "3", "5", "6"],
    seven: ["1", "3", "5", "b7"],
    maj7: ["1", "3", "5", "7"],
    add9: ["1", "3", "5", "2"],
    add11: ["1", "3", "5", "4"],
    sus2: ["1", "2", "5"],
    sus4: ["1", "4", "5"],
  });

export const CHORD_PRESETS: readonly { id: ChordPresetId; label: string }[] = Object.freeze([
  { id: "major", label: "Major" },
  { id: "minor", label: "Minor" },
  { id: "diminished", label: "Dim" },
  { id: "augmented", label: "Aug" },
  { id: "six", label: "6" },
  { id: "seven", label: "7" },
  { id: "maj7", label: "maj7" },
  { id: "add9", label: "add9" },
  { id: "add11", label: "add11" },
  { id: "sus2", label: "sus2" },
  { id: "sus4", label: "sus4" },
]);

const CONFLICT_GROUPS: readonly (readonly IntervalName[])[] = Object.freeze([
  ["b2", "2"],
  ["b3", "3"],
  ["b5", "5", "#5"],
  ["b7", "7"],
]);

const asOrderedUniqueIntervals = (values: Iterable<IntervalName>): IntervalName[] => {
  const set = new Set(values);
  return CHORD_INTERVAL_SELECTOR_OPTIONS.filter((interval) => set.has(interval));
};

export const getBaseQualityIntervals = (
  quality: BaseChordQuality,
): readonly IntervalName[] => BASE_QUALITY_INTERVALS[quality];

export const getChordPresetIntervals = (
  presetId: ChordPresetId,
): readonly IntervalName[] => CHORD_PRESET_INTERVALS[presetId];

export const getBaseQualityFromIntervals = (
  intervals: readonly IntervalName[],
): BaseChordQuality | null => {
  const set = new Set(intervals);
  if (!set.has("1")) {
    return null;
  }

  if (set.has("3") && set.has("5") && !set.has("b3") && !set.has("b5") && !set.has("#5")) {
    return "major";
  }

  if (set.has("b3") && set.has("5") && !set.has("3") && !set.has("b5") && !set.has("#5")) {
    return "minor";
  }

  if (set.has("b3") && set.has("b5") && !set.has("3") && !set.has("5") && !set.has("#5")) {
    return "diminished";
  }

  if (set.has("3") && set.has("#5") && !set.has("b3") && !set.has("5") && !set.has("b5")) {
    return "augmented";
  }

  if (
    set.has("2") &&
    set.has("5") &&
    !set.has("3") &&
    !set.has("b3") &&
    !set.has("4") &&
    !set.has("b5") &&
    !set.has("#5")
  ) {
    return "sus2";
  }

  if (
    set.has("4") &&
    set.has("5") &&
    !set.has("3") &&
    !set.has("b3") &&
    !set.has("2") &&
    !set.has("b5") &&
    !set.has("#5")
  ) {
    return "sus4";
  }

  return null;
};

export const toggleChordInterval = (
  intervals: readonly IntervalName[],
  interval: IntervalName,
): IntervalName[] => {
  if (interval === "1") {
    return asOrderedUniqueIntervals(intervals);
  }

  const set = new Set(intervals);
  if (set.has(interval)) {
    set.delete(interval);
  } else {
    for (const group of CONFLICT_GROUPS) {
      if (!group.includes(interval)) {
        continue;
      }

      for (const conflict of group) {
        if (conflict !== interval) {
          set.delete(conflict);
        }
      }
    }
    set.add(interval);
  }

  set.add("1");
  return asOrderedUniqueIntervals(set);
};

export const applyChordPreset = (
  _intervals: readonly IntervalName[],
  presetId: ChordPresetId,
): IntervalName[] => [...getChordPresetIntervals(presetId)];

const intervalsEqual = (
  left: readonly IntervalName[],
  right: readonly IntervalName[],
): boolean => {
  const leftOrdered = asOrderedUniqueIntervals(left);
  const rightOrdered = asOrderedUniqueIntervals(right);
  if (leftOrdered.length !== rightOrdered.length) {
    return false;
  }

  return leftOrdered.every((interval, index) => interval === rightOrdered[index]);
};

export const getActiveChordPresets = (
  intervals: readonly IntervalName[],
): ChordPresetId[] => {
  for (const preset of CHORD_PRESETS) {
    if (intervalsEqual(intervals, getChordPresetIntervals(preset.id))) {
      return [preset.id];
    }
  }

  return [];
};

const getIntervalFormula = (intervals: readonly IntervalName[]): string =>
  asOrderedUniqueIntervals(intervals).join(", ");

export const resolveChordDisplay = (
  rootLabel: string,
  intervals: readonly IntervalName[],
): { label: string; resolved: boolean } => {
  const ordered = asOrderedUniqueIntervals(intervals);
  const baseQuality = getBaseQualityFromIntervals(ordered);
  if (baseQuality === null) {
    return {
      label: `${rootLabel} (${getIntervalFormula(ordered)})`,
      resolved: false,
    };
  }

  const set = new Set(ordered);
  if (set.has("b2") || set.has("b5") || set.has("#5")) {
    const supportedBase = baseQuality === "diminished" || baseQuality === "augmented";
    if (!supportedBase) {
      return {
        label: `${rootLabel} (${getIntervalFormula(ordered)})`,
        resolved: false,
      };
    }
  }

  if (set.has("b7") && set.has("7")) {
    return {
      label: `${rootLabel} (${getIntervalFormula(ordered)})`,
      resolved: false,
    };
  }

  const baseName = (() => {
    switch (baseQuality) {
      case "major":
        return rootLabel;
      case "minor":
        return `${rootLabel}m`;
      case "diminished":
        return `${rootLabel}dim`;
      case "augmented":
        return `${rootLabel}aug`;
      case "sus2":
        return `${rootLabel}sus2`;
      case "sus4":
        return `${rootLabel}sus4`;
      default:
        return rootLabel;
    }
  })();

  const seventhSuffix = (() => {
    if (set.has("7")) {
      if (baseQuality === "major") {
        return "maj7";
      }
      if (baseQuality === "minor") {
        return "maj7";
      }
      return "maj7";
    }

    if (set.has("b7")) {
      if (baseQuality === "major") {
        return "7";
      }
      if (baseQuality === "minor") {
        return "7";
      }
      return "7";
    }

    return "";
  })();

  const addOns: string[] = [];
  if (set.has("2") && baseQuality !== "sus2") {
    addOns.push("add9");
  }
  if (set.has("4") && baseQuality !== "sus4") {
    addOns.push("add11");
  }
  if (set.has("6")) {
    addOns.push("6");
  }

  const label = `${baseName}${seventhSuffix}${addOns.length > 0 ? ` ${addOns.join(" ")}` : ""}`.trim();
  const supportedIntervals = new Set<IntervalName>([
    ...getBaseQualityIntervals(baseQuality),
    ...NON_CORE_ADDON_INTERVALS,
    "2",
    "4",
  ]);
  const unsupported = ordered.some((interval) => !supportedIntervals.has(interval));
  if (unsupported) {
    return {
      label: `${rootLabel} (${getIntervalFormula(ordered)})`,
      resolved: false,
    };
  }

  return { label, resolved: true };
};
