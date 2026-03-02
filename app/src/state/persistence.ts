import {
  parseIntervalName,
  type AppState,
  type IntervalName,
  type PitchClass,
  type ScaleType,
} from "@core";
import {
  SCALE_OPTIONS,
  TUNING_PRESETS,
  createInitialAppState,
  createInitialViewFilterState,
  type TuningPresetId,
  type ViewFilterState,
} from "./appStateStore";
import { CHORD_INTERVAL_SELECTOR_OPTIONS } from "./chordBuilder";

const STORAGE_KEY = "chord-finder.session.v1";
const APP_STATE_VERSION = 1 as const;

interface PersistedSessionV1 {
  version: 1;
  appState: AppState;
  viewState: ViewFilterState;
}

const NOTE_NAMING_POLICIES = new Set(["sharps", "flats"]);
const SCALE_TYPES = new Set(SCALE_OPTIONS);
const CHORD_INTERVALS = new Set(CHORD_INTERVAL_SELECTOR_OPTIONS);
const TUNING_PRESET_IDS = new Set<TuningPresetId>([
  ...TUNING_PRESETS.map((preset) => preset.id),
  "custom",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isPitchClass = (value: unknown): value is PitchClass =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= 11;

const sanitizeIntervals = (value: unknown): IntervalName[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<IntervalName>();
  for (const rawValue of value) {
    if (typeof rawValue !== "string") {
      continue;
    }

    const parsed = parseIntervalName(rawValue);
    if (!parsed) {
      continue;
    }

    unique.add(parsed);
  }

  return [...unique];
};

const sanitizeChordIntervals = (value: unknown): IntervalName[] => {
  const unique = new Set<IntervalName>();

  for (const interval of sanitizeIntervals(value)) {
    if (CHORD_INTERVALS.has(interval)) {
      unique.add(interval);
    }
  }

  unique.add("1");
  return CHORD_INTERVAL_SELECTOR_OPTIONS.filter((interval) => unique.has(interval));
};

const sanitizeAppState = (value: unknown): AppState => {
  const fallback = createInitialAppState();
  if (!isRecord(value)) {
    return fallback;
  }

  const noteNamingPolicy = NOTE_NAMING_POLICIES.has(value.noteNamingPolicy as string)
    ? (value.noteNamingPolicy as AppState["noteNamingPolicy"])
    : fallback.noteNamingPolicy;

  const keyScale = (() => {
    if (!isRecord(value.keyScale)) {
      return null;
    }

    const rootPitchClass = isPitchClass(value.keyScale.rootPitchClass)
      ? value.keyScale.rootPitchClass
      : null;
    const scaleTypeRaw = value.keyScale.scaleType;
    const scaleType =
      typeof scaleTypeRaw === "string" && SCALE_TYPES.has(scaleTypeRaw as ScaleType)
        ? (scaleTypeRaw as ScaleType)
        : null;

    if (rootPitchClass === null || scaleType === null) {
      return null;
    }

    return {
      rootPitchClass,
      scaleType,
    };
  })();

  const chord = (() => {
    if (!isRecord(value.chord)) {
      return null;
    }

    const rootPitchClass = isPitchClass(value.chord.rootPitchClass)
      ? value.chord.rootPitchClass
      : null;
    const intervals = sanitizeChordIntervals(value.chord.intervals);

    if (rootPitchClass === null || intervals.length === 0) {
      return null;
    }

    return {
      rootPitchClass,
      intervals,
    };
  })();

  return {
    noteNamingPolicy,
    keyScale,
    chord,
    includeIntervals: sanitizeIntervals(value.includeIntervals),
    excludeIntervals: sanitizeIntervals(value.excludeIntervals),
  };
};

const derivePresetId = (
  presetId: TuningPresetId,
  stringPitchClasses: readonly PitchClass[],
): TuningPresetId => {
  if (presetId !== "custom") {
    return presetId;
  }

  const matchingPreset = TUNING_PRESETS.find((preset) =>
    preset.stringPitchClasses.every(
      (pitchClass, index) => pitchClass === stringPitchClasses[index],
    ),
  );

  return matchingPreset?.id ?? "custom";
};

const sanitizeViewState = (value: unknown): ViewFilterState => {
  const fallback = createInitialViewFilterState();
  if (!isRecord(value)) {
    return fallback;
  }

  const stringPitchClasses = Array.isArray(value.stringPitchClasses)
    ? value.stringPitchClasses.filter(isPitchClass)
    : [];
  const normalizedPitchClasses =
    stringPitchClasses.length === 6 ? stringPitchClasses : [...fallback.stringPitchClasses];

  const minFret = typeof value.minFret === "number" ? Math.max(0, Math.min(22, value.minFret)) : fallback.minFret;
  const maxFret = typeof value.maxFret === "number" ? Math.max(0, Math.min(22, value.maxFret)) : fallback.maxFret;

  const enabledStringIndicesRaw = Array.isArray(value.enabledStringIndices)
    ? value.enabledStringIndices
    : fallback.enabledStringIndices;
  const enabledStringIndices = [
    ...new Set(
      enabledStringIndicesRaw.filter(
        (index): index is number =>
          typeof index === "number" &&
          Number.isInteger(index) &&
          index >= 0 &&
          index < normalizedPitchClasses.length,
      ),
    ),
  ].sort((left, right) => left - right);

  const tuningPresetId =
    TUNING_PRESET_IDS.has(value.tuningPresetId as TuningPresetId)
      ? (value.tuningPresetId as TuningPresetId)
      : fallback.tuningPresetId;

  return {
    minFret: Math.min(minFret, maxFret),
    maxFret: Math.max(minFret, maxFret),
    enabledStringIndices:
      enabledStringIndices.length > 0 ? enabledStringIndices : [0],
    showUnselectedNotes:
      typeof value.showUnselectedNotes === "boolean"
        ? value.showUnselectedNotes
        : fallback.showUnselectedNotes,
    tuningPresetId: derivePresetId(tuningPresetId, normalizedPitchClasses),
    stringPitchClasses: normalizedPitchClasses,
  };
};

export const loadPersistedSession = (): {
  appState: AppState;
  viewState: ViewFilterState;
} | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.version !== APP_STATE_VERSION) {
      return null;
    }

    return {
      appState: sanitizeAppState(parsed.appState),
      viewState: sanitizeViewState(parsed.viewState),
    };
  } catch {
    return null;
  }
};

export const persistSession = (
  appState: AppState,
  viewState: ViewFilterState,
): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const payload: PersistedSessionV1 = {
    version: APP_STATE_VERSION,
    appState,
    viewState,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
};
