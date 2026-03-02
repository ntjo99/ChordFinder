import {
  formatPitchClass,
  type AppState,
  type ChordExtension,
  type ChordQuality,
  type IntervalName,
  type NoteNamingPolicy,
  type PitchClass,
  type ScaleType,
} from "@core";
import {
  CHORD_EXTENSION_OPTIONS,
  FRET_OPTIONS,
  INTERVAL_OPTIONS,
  SCALE_OPTIONS,
  STANDARD_TUNING,
  type ViewFilterState,
} from "../state/appStateStore";
import { IntervalChipGroup } from "./IntervalChipGroup";
import { ToggleGroup } from "./ToggleGroup";

interface FilterPanelProps {
  state: AppState;
  viewState: ViewFilterState;
  keyRootOptions: readonly PitchClass[];
  chordRootOptions: readonly PitchClass[];
  chordQualityOptions: readonly ChordQuality[];
  onNoteNamingChange: (policy: NoteNamingPolicy) => void;
  onKeyEnabledChange: (enabled: boolean) => void;
  onKeyRootChange: (root: PitchClass) => void;
  onScaleTypeChange: (scaleType: ScaleType) => void;
  onChordEnabledChange: (enabled: boolean) => void;
  onChordRootChange: (root: PitchClass) => void;
  onChordQualityChange: (quality: ChordQuality) => void;
  onChordExtensionToggle: (extension: ChordExtension) => void;
  onIncludeIntervalToggle: (interval: IntervalName) => void;
  onExcludeIntervalToggle: (interval: IntervalName) => void;
  onMinFretChange: (value: number) => void;
  onMaxFretChange: (value: number) => void;
  onStringToggle: (stringIndex: number) => void;
}

const toPitchClass = (value: string): PitchClass => Number(value) as PitchClass;

const asScaleType = (value: string): ScaleType => value as ScaleType;
const asChordQuality = (value: string): ChordQuality => value as ChordQuality;

export function FilterPanel({
  state,
  viewState,
  keyRootOptions,
  chordRootOptions,
  chordQualityOptions,
  onNoteNamingChange,
  onKeyEnabledChange,
  onKeyRootChange,
  onScaleTypeChange,
  onChordEnabledChange,
  onChordRootChange,
  onChordQualityChange,
  onChordExtensionToggle,
  onIncludeIntervalToggle,
  onExcludeIntervalToggle,
  onMinFretChange,
  onMaxFretChange,
  onStringToggle,
}: FilterPanelProps) {
  const extensionSelected = state.chord?.extensions ?? [];
  const selectedStrings = viewState.enabledStringIndices.map((index) => String(index));

  const stringItems = STANDARD_TUNING.map((pitchClass, index) => ({
    id: String(index),
    label: `S${6 - index} ${formatPitchClass(pitchClass, state.noteNamingPolicy)}`,
  }));

  return (
    <aside className="filter-panel">
      <details className="filter-section" open>
        <summary>Notation</summary>
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
              {SCALE_OPTIONS.map((scaleType) => (
                <option key={scaleType} value={scaleType}>
                  {scaleType === "naturalMinor" ? "Natural Minor" : "Major"}
                </option>
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

          <label className="field-label">
            Quality
            <select
              value={state.chord?.quality ?? chordQualityOptions[0] ?? "major"}
              disabled={state.chord === null}
              onChange={(event) => onChordQualityChange(asChordQuality(event.target.value))}
            >
              {chordQualityOptions.map((quality) => (
                <option key={quality} value={quality}>
                  {quality}
                </option>
              ))}
            </select>
          </label>

          <p className="field-subtitle">Extensions</p>
          <ToggleGroup
            items={CHORD_EXTENSION_OPTIONS.map((extension) => ({
              id: extension,
              label: extension,
            }))}
            selectedIds={extensionSelected}
            onToggle={(id) => onChordExtensionToggle(id as ChordExtension)}
            disabled={state.chord === null}
          />
        </div>
      </details>

      <details className="filter-section" open>
        <summary>Intervals</summary>
        <div className="filter-body">
          <IntervalChipGroup
            title="Include"
            intervals={INTERVAL_OPTIONS}
            selected={state.includeIntervals}
            onToggle={onIncludeIntervalToggle}
          />
          <IntervalChipGroup
            title="Exclude"
            intervals={INTERVAL_OPTIONS}
            selected={state.excludeIntervals}
            onToggle={onExcludeIntervalToggle}
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

          <p className="field-subtitle">Strings</p>
          <ToggleGroup
            items={stringItems}
            selectedIds={selectedStrings}
            onToggle={(id) => onStringToggle(Number(id))}
          />
        </div>
      </details>
    </aside>
  );
}
