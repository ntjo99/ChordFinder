import {
  computeAllowedNoteNames,
  getDiatonicChordQualitiesForRoot,
  getDiatonicChordRoots,
  type AppState,
  type IntervalName,
  type PitchClass,
} from "@core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FilterPanel } from "./components/FilterPanel";
import { FretboardView } from "./components/FretboardView";
import { StateSummaryBar } from "./components/StateSummaryBar";
import { VisualLegend } from "./components/VisualLegend";
import "./App.css";
import {
  ALL_PITCH_CLASS_OPTIONS,
  CHORD_QUALITY_OPTIONS,
  createInitialAppState,
  createInitialViewFilterState,
  resolveTuningPreset,
} from "./state/appStateStore";
import {
  applyChordPreset,
  getBaseQualityIntervals,
  toggleChordInterval,
  type BaseChordQuality,
  type ChordPresetId,
} from "./state/chordBuilder";
import { buildStateSummary, deriveFretboardState } from "./state/derivedSelectors";
import { loadPersistedSession, persistSession } from "./state/persistence";

const constrainChordToDiatonicIfNeeded = (state: AppState): AppState => {
  if (!state.chord || !state.keyScale) {
    return state;
  }

  const chordRoots = getDiatonicChordRoots(
    state.keyScale.rootPitchClass,
    state.keyScale.scaleType,
  );
  const rootPitchClass = chordRoots.includes(state.chord.rootPitchClass)
    ? state.chord.rootPitchClass
    : chordRoots[0] ?? state.chord.rootPitchClass;

  if (rootPitchClass === state.chord.rootPitchClass) {
    return state;
  }

  return {
    ...state,
    chord: {
      ...state.chord,
      rootPitchClass,
    },
  };
};

const sanitizeAppState = (state: AppState): AppState => {
  const withClearedIntervalFilters: AppState = {
    ...state,
    includeIntervals: [],
    excludeIntervals: [],
  };

  return constrainChordToDiatonicIfNeeded(withClearedIntervalFilters);
};

const createSessionBootstrap = () => {
  const persisted = loadPersistedSession();
  return {
    restored: persisted !== null,
    appState: persisted ? sanitizeAppState(persisted.appState) : createInitialAppState(),
    viewState: persisted ? persisted.viewState : createInitialViewFilterState(),
  };
};

function App() {
  const [bootstrap] = useState(createSessionBootstrap);
  const [appState, setAppState] = useState<AppState>(bootstrap.appState);
  const [viewState, setViewState] = useState(bootstrap.viewState);
  const updateAppState = useCallback(
    (updater: (state: AppState) => AppState) => {
      setAppState((previous) => sanitizeAppState(updater(previous)));
    },
    [],
  );

  const availableChordRoots = useMemo(() => {
    if (!appState.keyScale) {
      return ALL_PITCH_CLASS_OPTIONS;
    }

    return getDiatonicChordRoots(
      appState.keyScale.rootPitchClass,
      appState.keyScale.scaleType,
    );
  }, [appState.keyScale]);

  const resolveChordQualitiesForRoot = useCallback(
    (rootPitchClass: PitchClass): readonly BaseChordQuality[] => {
      if (!appState.keyScale) {
        return CHORD_QUALITY_OPTIONS;
      }

      const qualitySet = new Set<BaseChordQuality>(CHORD_QUALITY_OPTIONS);
      const qualities = getDiatonicChordQualitiesForRoot(
        appState.keyScale.rootPitchClass,
        appState.keyScale.scaleType,
        rootPitchClass,
      ).filter((quality): quality is BaseChordQuality => qualitySet.has(quality as BaseChordQuality));

      return qualities.length > 0 ? qualities : CHORD_QUALITY_OPTIONS;
    },
    [appState.keyScale],
  );

  const handleReset = () => {
    setAppState(createInitialAppState());
    setViewState(createInitialViewFilterState());
  };

  const handleChordEnabledChange = (enabled: boolean) => {
    updateAppState((previous) => {
      if (!enabled) {
        return {
          ...previous,
          chord: null,
        };
      }

      const roots = previous.keyScale
        ? getDiatonicChordRoots(
            previous.keyScale.rootPitchClass,
            previous.keyScale.scaleType,
          )
        : ALL_PITCH_CLASS_OPTIONS;
      const rootPitchClass = roots[0] ?? 0;
      const quality = resolveChordQualitiesForRoot(rootPitchClass)[0] ?? "major";

      return {
        ...previous,
        chord: {
          rootPitchClass,
          intervals: [...getBaseQualityIntervals(quality)],
        },
      };
    });
  };

  const handleChordRootChange = (rootPitchClass: PitchClass) => {
    updateAppState((previous) => {
      if (!previous.chord) {
        return previous;
      }

      return {
        ...previous,
        chord: {
          ...previous.chord,
          rootPitchClass,
        },
      };
    });
  };

  const handleChordPresetToggle = (presetId: ChordPresetId) => {
    updateAppState((previous) => {
      if (!previous.chord) {
        return previous;
      }

      return {
        ...previous,
        chord: {
          ...previous.chord,
          intervals: applyChordPreset(previous.chord.intervals, presetId),
        },
      };
    });
  };

  const handleChordIntervalToggle = (interval: IntervalName) => {
    updateAppState((previous) => {
      if (!previous.chord) {
        return previous;
      }

      return {
        ...previous,
        chord: {
          ...previous.chord,
          intervals: toggleChordInterval(previous.chord.intervals, interval),
        },
      };
    });
  };

  const handleStringToggle = (stringIndex: number) => {
    setViewState((previous) => {
      const nextSet = new Set(previous.enabledStringIndices);

      if (nextSet.has(stringIndex)) {
        if (nextSet.size <= 1) {
          return previous;
        }
        nextSet.delete(stringIndex);
      } else {
        nextSet.add(stringIndex);
      }

      return {
        ...previous,
        enabledStringIndices: [...nextSet].sort((left, right) => left - right),
      };
    });
  };

  const normalizeEnabledStringIndices = (
    enabledStringIndices: readonly number[],
    stringCount: number,
  ): number[] => {
    const next = [...new Set(enabledStringIndices)]
      .filter((index) => index >= 0 && index < stringCount)
      .sort((left, right) => left - right);

    return next.length > 0 ? next : [0];
  };

  const derivedState = useMemo(
    () => deriveFretboardState(appState, viewState),
    [appState, viewState],
  );
  const allowedNotes = useMemo(() => computeAllowedNoteNames(appState), [appState]);
  const stateSummary = useMemo(() => buildStateSummary(appState), [appState]);
  const tuningSummary = useMemo(() => {
    if (viewState.tuningPresetId === "custom") {
      return "Custom";
    }

    return resolveTuningPreset(viewState.tuningPresetId)?.label ?? "Custom";
  }, [viewState.tuningPresetId]);
  const viewSummary = `Frets ${viewState.minFret}-${viewState.maxFret} | Strings ${
    viewState.enabledStringIndices.length
  }/${viewState.stringPitchClasses.length} | Tuning ${tuningSummary}`;
  const sessionStatus = bootstrap.restored
    ? "Local autosave active | Restored previous session"
    : "Local autosave active";

  useEffect(() => {
    persistSession(appState, viewState);
  }, [appState, viewState]);

  return (
    <main className="app-shell">
      <div className="ambient-glow" aria-hidden="true" />
      <section className="workspace-card">
        <StateSummaryBar
          summary="Fretboard Filter"
          detail={stateSummary}
          allowedNotes={allowedNotes}
          status={sessionStatus}
          onReset={handleReset}
        >
          <p className="state-summary-inline">{viewSummary}</p>
        </StateSummaryBar>

        <section className="workspace-content">
          <section className="fretboard-stack">
            <section className="fretboard-frame">
              <FretboardView state={derivedState} />
            </section>
            <VisualLegend />
          </section>

          <FilterPanel
            state={appState}
            viewState={viewState}
            keyRootOptions={ALL_PITCH_CLASS_OPTIONS}
            chordRootOptions={availableChordRoots}
            onNoteNamingChange={(policy) =>
              updateAppState((previous) => ({
                ...previous,
                noteNamingPolicy: policy,
              }))
            }
            onKeyEnabledChange={(enabled) =>
              updateAppState((previous) => ({
                ...previous,
                keyScale: enabled
                  ? previous.keyScale ?? { rootPitchClass: 0, scaleType: "major" }
                  : null,
              }))
            }
            onKeyRootChange={(rootPitchClass) =>
              updateAppState((previous) => ({
                ...previous,
                keyScale: previous.keyScale
                  ? {
                      ...previous.keyScale,
                      rootPitchClass,
                    }
                  : previous.keyScale,
              }))
            }
            onScaleTypeChange={(scaleType) =>
              updateAppState((previous) => ({
                ...previous,
                keyScale: previous.keyScale
                  ? {
                      ...previous.keyScale,
                      scaleType,
                    }
                  : previous.keyScale,
              }))
            }
            onChordEnabledChange={handleChordEnabledChange}
            onChordRootChange={handleChordRootChange}
            onChordPresetToggle={handleChordPresetToggle}
            onChordIntervalToggle={handleChordIntervalToggle}
            onTuningPresetChange={(presetId) =>
              setViewState((previous) => {
                if (presetId === "custom") {
                  return {
                    ...previous,
                    tuningPresetId: "custom",
                  };
                }

                const preset = resolveTuningPreset(presetId);
                if (!preset) {
                  return previous;
                }

                const stringPitchClasses = [...preset.stringPitchClasses];
                return {
                  ...previous,
                  tuningPresetId: preset.id,
                  stringPitchClasses,
                  enabledStringIndices: normalizeEnabledStringIndices(
                    previous.enabledStringIndices,
                    stringPitchClasses.length,
                  ),
                };
              })
            }
            onCustomTuningStringChange={(stringIndex, pitchClass) =>
              setViewState((previous) => {
                if (
                  stringIndex < 0 ||
                  stringIndex >= previous.stringPitchClasses.length
                ) {
                  return previous;
                }

                const nextPitchClasses = [...previous.stringPitchClasses];
                nextPitchClasses[stringIndex] = pitchClass;
                return {
                  ...previous,
                  tuningPresetId: "custom",
                  stringPitchClasses: nextPitchClasses,
                };
              })
            }
            onMinFretChange={(value) =>
              setViewState((previous) => ({
                ...previous,
                minFret: value,
                maxFret: value > previous.maxFret ? value : previous.maxFret,
              }))
            }
            onMaxFretChange={(value) =>
              setViewState((previous) => ({
                ...previous,
                minFret: value < previous.minFret ? value : previous.minFret,
                maxFret: value,
              }))
            }
            onStringToggle={handleStringToggle}
            onShowUnselectedNotesChange={(value) =>
              setViewState((previous) => ({
                ...previous,
                showUnselectedNotes: value,
              }))
            }
          />
        </section>
      </section>
    </main>
  );
}

export default App;
