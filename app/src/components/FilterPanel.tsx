import {
  formatPitchClass,
  generateScalePitchClasses,
  intervalToPitchClass,
  type AppState,
  type IntervalName,
  type NoteNamingPolicy,
  type PitchClass,
  type ScaleType,
} from "@core";
import {
  ALL_PITCH_CLASS_OPTIONS,
  FRET_OPTIONS,
  SCALE_OPTIONS,
  TUNING_PRESETS,
  type TuningPresetId,
  type ViewFilterState,
} from "../state/appStateStore";
import {
  CHORD_INTERVAL_SELECTOR_OPTIONS,
  CHORD_PRESETS,
  getActiveChordPresets,
  getChordPresetIntervals,
  resolveChordDisplay,
  type ChordPresetId,
} from "../state/chordBuilder";
import { IntervalChipGroup } from "./IntervalChipGroup";
import { ToggleGroup } from "./ToggleGroup";

interface FilterPanelProps {
  state: AppState;
  viewState: ViewFilterState;
  keyRootOptions: readonly PitchClass[];
  chordRootOptions: readonly PitchClass[];
  onNoteNamingChange: (policy: NoteNamingPolicy) => void;
  onKeyEnabledChange: (enabled: boolean) => void;
  onKeyRootChange: (root: PitchClass) => void;
  onScaleTypeChange: (scaleType: ScaleType) => void;
  onChordEnabledChange: (enabled: boolean) => void;
  onChordRootChange: (root: PitchClass) => void;
  onChordPresetToggle: (presetId: ChordPresetId) => void;
  onChordIntervalToggle: (interval: IntervalName) => void;
  onTuningPresetChange: (presetId: TuningPresetId) => void;
  onCustomTuningStringChange: (stringIndex: number, pitchClass: PitchClass) => void;
  onMinFretChange: (value: number) => void;
  onMaxFretChange: (value: number) => void;
  onStringToggle: (stringIndex: number) => void;
  onShowUnselectedNotesChange: (value: boolean) => void;
}

const toPitchClass = (value: string): PitchClass => Number(value) as PitchClass;
const asScaleType = (value: string): ScaleType => value as ScaleType;
const asTuningPresetId = (value: string): TuningPresetId => value as TuningPresetId;

const formatScaleLabel = (scaleType: ScaleType): string => {
  switch (scaleType) {
    case "major":
      return "Major (Ionian)";
    case "naturalMinor":
      return "Aeolian (Natural Minor)";
    case "harmonicMinor":
      return "Harmonic Minor";
    case "melodicMinor":
      return "Melodic Minor (Ascending)";
    case "majorPentatonic":
      return "Major Pentatonic";
    case "minorPentatonic":
      return "Minor Pentatonic";
    case "minorBlues":
      return "Minor Blues";
    case "majorBlues":
      return "Major Blues";
    case "dorian":
      return "Dorian";
    case "phrygian":
      return "Phrygian";
    case "lydian":
      return "Lydian";
    case "mixolydian":
      return "Mixolydian";
    case "locrian":
      return "Locrian";
    default:
      return scaleType;
  }
};

const SCALE_GROUPS: readonly {
  label: string;
  scaleTypes: readonly ScaleType[];
}[] = [
  {
    label: "Modes",
    scaleTypes: [
      "major",
      "dorian",
      "phrygian",
      "lydian",
      "mixolydian",
      "naturalMinor",
      "locrian",
    ],
  },
  {
    label: "Minor Families",
    scaleTypes: ["harmonicMinor", "melodicMinor"],
  },
  {
    label: "Pentatonic & Blues",
    scaleTypes: ["majorPentatonic", "minorPentatonic", "minorBlues", "majorBlues"],
  },
];

export function FilterPanel({
  state,
  viewState,
  keyRootOptions,
  chordRootOptions,
  onNoteNamingChange,
  onKeyEnabledChange,
  onKeyRootChange,
  onScaleTypeChange,
  onChordEnabledChange,
  onChordRootChange,
  onChordPresetToggle,
  onChordIntervalToggle,
  onTuningPresetChange,
  onCustomTuningStringChange,
  onMinFretChange,
  onMaxFretChange,
  onStringToggle,
  onShowUnselectedNotesChange,
}: FilterPanelProps) {
  const selectedStrings = viewState.enabledStringIndices.map((index) => String(index));
  const scaleSet = new Set(SCALE_OPTIONS);
  const groupedScaleOptions = SCALE_GROUPS.map((group) => ({
    ...group,
    scaleTypes: group.scaleTypes.filter((scaleType) => scaleSet.has(scaleType)),
  })).filter((group) => group.scaleTypes.length > 0);

  const stringItems = viewState.stringPitchClasses.map((pitchClass, index) => ({
    id: String(index),
    label: `S${viewState.stringPitchClasses.length - index} ${formatPitchClass(pitchClass, state.noteNamingPolicy)}`,
  }));

  const activePresets = state.chord ? getActiveChordPresets(state.chord.intervals) : [];
  const selectedIntervals = state.chord ? state.chord.intervals : [];
  const chordIntervalSet = new Set<IntervalName>(selectedIntervals);
  const keyPitchClassSet =
    state.chord && state.keyScale
      ? new Set(
          generateScalePitchClasses(
            state.keyScale.rootPitchClass,
            state.keyScale.scaleType,
          ),
        )
      : null;
  const chordRootPitchClass = state.chord?.rootPitchClass ?? null;
  const resolvesInsideKey = (intervals: readonly IntervalName[]): boolean => {
    if (keyPitchClassSet === null || chordRootPitchClass === null) {
      return true;
    }

    return intervals.every((interval) =>
      keyPitchClassSet.has(intervalToPitchClass(chordRootPitchClass, interval)),
    );
  };
  const presetDisabledSet = new Set<ChordPresetId>();
  if (state.chord !== null) {
    for (const preset of CHORD_PRESETS) {
      const presetIntervals = getChordPresetIntervals(preset.id);
      const isSelected = activePresets.includes(preset.id);
      if (!isSelected && !resolvesInsideKey(presetIntervals)) {
        presetDisabledSet.add(preset.id);
      }
    }
  }
  const presetItems = CHORD_PRESETS.map((preset) => ({
    id: preset.id,
    label: preset.label,
    disabled: presetDisabledSet.has(preset.id),
  }));
  const disabledIntervals = CHORD_INTERVAL_SELECTOR_OPTIONS.filter((interval) => {
    if (!state.chord) {
      return true;
    }

    if (interval === "1") {
      return true;
    }

    const outsideKey =
      keyPitchClassSet !== null &&
      !keyPitchClassSet.has(intervalToPitchClass(state.chord.rootPitchClass, interval));

    return outsideKey && !chordIntervalSet.has(interval);
  });
  const resolvedChordLabel =
    state.chord === null
      ? "No chord"
      : resolveChordDisplay(
          formatPitchClass(state.chord.rootPitchClass, state.noteNamingPolicy),
          state.chord.intervals,
        ).label;

  return (
    <aside className="filter-panel">
      <details className="filter-section" open>
        <summary>Settings</summary>
        <div className="filter-body">
          <label className="field-label">
            Note Naming
            <select
              value={state.noteNamingPolicy}
              onChange={(event) =>
                onNoteNamingChange(event.target.value as NoteNamingPolicy)
              }
            >
              <option value="sharps">Sharps</option>
              <option value="flats">Flats</option>
            </select>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={viewState.showUnselectedNotes}
              onChange={(event) =>
                onShowUnselectedNotesChange(event.target.checked)
              }
            />
            Show unselected notes
          </label>
        </div>
      </details>

      <details className="filter-section" open>
        <summary>Key / Scale</summary>
        <div className="filter-body">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={state.keyScale !== null}
              onChange={(event) => onKeyEnabledChange(event.target.checked)}
            />
            Enable key/scale filter
          </label>

          <label className="field-label">
            Key Root
            <select
              value={state.keyScale?.rootPitchClass ?? 0}
              disabled={state.keyScale === null}
              onChange={(event) => onKeyRootChange(toPitchClass(event.target.value))}
            >
              {keyRootOptions.map((pitchClass) => (
                <option key={pitchClass} value={pitchClass}>
                  {formatPitchClass(pitchClass, state.noteNamingPolicy)}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Scale
            <select
              value={state.keyScale?.scaleType ?? "major"}
              disabled={state.keyScale === null}
              onChange={(event) => onScaleTypeChange(asScaleType(event.target.value))}
            >
              {groupedScaleOptions.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.scaleTypes.map((scaleType) => (
                    <option key={scaleType} value={scaleType}>
                      {formatScaleLabel(scaleType)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>
      </details>

      <details className="filter-section" open>
        <summary>Chord</summary>
        <div className="filter-body">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={state.chord !== null}
              onChange={(event) => onChordEnabledChange(event.target.checked)}
            />
            Enable chord filter
          </label>

          <label className="field-label">
            Chord Root
            <select
              value={state.chord?.rootPitchClass ?? chordRootOptions[0] ?? 0}
              disabled={state.chord === null}
              onChange={(event) => onChordRootChange(toPitchClass(event.target.value))}
            >
              {chordRootOptions.map((pitchClass) => (
                <option key={pitchClass} value={pitchClass}>
                  {formatPitchClass(pitchClass, state.noteNamingPolicy)}
                </option>
              ))}
            </select>
          </label>

          <p className="field-subtitle">Presets</p>
          <ToggleGroup
            items={presetItems}
            selectedIds={activePresets}
            onToggle={(id) => onChordPresetToggle(id as ChordPresetId)}
            disabled={state.chord === null}
            ariaLabel="Chord preset selection"
          />
          <p className="field-subtitle">Resolved: {resolvedChordLabel}</p>
        </div>
      </details>

      <details className="filter-section" open>
        <summary>Intervals</summary>
        <div className="filter-body">
          <IntervalChipGroup
            title="Chord Intervals"
            intervals={CHORD_INTERVAL_SELECTOR_OPTIONS}
            selected={selectedIntervals}
            disabledIntervals={disabledIntervals}
            onToggle={onChordIntervalToggle}
          />
        </div>
      </details>

      <details className="filter-section" open>
        <summary>Fretboard View</summary>
        <div className="filter-body">
          <div className="fret-range-row">
            <label className="field-label">
              Min Fret
              <select
                value={viewState.minFret}
                onChange={(event) => onMinFretChange(Number(event.target.value))}
              >
                {FRET_OPTIONS.map((fret) => (
                  <option key={fret} value={fret}>
                    {fret}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Max Fret
              <select
                value={viewState.maxFret}
                onChange={(event) => onMaxFretChange(Number(event.target.value))}
              >
                {FRET_OPTIONS.map((fret) => (
                  <option key={fret} value={fret}>
                    {fret}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field-label">
            Tuning Preset
            <select
              value={viewState.tuningPresetId}
              onChange={(event) => onTuningPresetChange(asTuningPresetId(event.target.value))}
            >
              {TUNING_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
              <option value="custom">Custom</option>
            </select>
          </label>

          <p className="field-subtitle">
            Custom Tuning (S{viewState.stringPitchClasses.length} {"->"} S1)
          </p>
          <div className="tuning-grid">
            {viewState.stringPitchClasses.map((pitchClass, index) => (
              <label key={`tuning-${index}`} className="field-label">
                S{viewState.stringPitchClasses.length - index}
                <select
                  value={pitchClass}
                  onChange={(event) =>
                    onCustomTuningStringChange(index, toPitchClass(event.target.value))
                  }
                >
                  {ALL_PITCH_CLASS_OPTIONS.map((optionPitchClass) => (
                    <option key={`pc-${optionPitchClass}`} value={optionPitchClass}>
                      {formatPitchClass(optionPitchClass, state.noteNamingPolicy)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <p className="field-subtitle">Strings</p>
          <ToggleGroup
            items={stringItems}
            selectedIds={selectedStrings}
            onToggle={(id) => onStringToggle(Number(id))}
            ariaLabel="Enabled strings"
          />
        </div>
      </details>
    </aside>
  );
}
