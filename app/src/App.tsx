import {
  computeAllowedNoteNames,
  getDiatonicChordQualitiesForRoot,
  getDiatonicChordRoots,
  type ChordExtension,
  type ChordQuality,
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
  CHORD_EXTENSION_OPTIONS,
  CHORD_QUALITY_OPTIONS,
  INTERVAL_OPTIONS,
  createInitialAppState,
  createInitialViewFilterState,
} from "./state/appStateStore";
import { buildStateSummary, deriveFretboardState } from "./state/derivedSelectors";

const toOrderedIntervals = (
  values: Iterable<IntervalName>,
): IntervalName[] => {
  const valueSet = new Set(values);
  return INTERVAL_OPTIONS.filter((interval) => valueSet.has(interval));
};

const toggleInterval = (
  existing: readonly IntervalName[],
  interval: IntervalName,
): IntervalName[] => {
  const next = new Set(existing);
  if (next.has(interval)) {
    next.delete(interval);
  } else {
    next.add(interval);
  }

  return toOrderedIntervals(next);
};

function App() {
  const [appState, setAppState] = useState(createInitialAppState);
  const [viewState, setViewState] = useState(createInitialViewFilterState);

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
    (rootPitchClass: PitchClass): readonly ChordQuality[] => {
      if (!appState.keyScale) {
        return CHORD_QUALITY_OPTIONS;
      }

      const qualities = getDiatonicChordQualitiesForRoot(
        appState.keyScale.rootPitchClass,
        appState.keyScale.scaleType,
        rootPitchClass,
      );

      return qualities.length > 0 ? qualities : CHORD_QUALITY_OPTIONS;
    },
    [appState.keyScale],
  );

  const chordRootForOptions = appState.chord?.rootPitchClass ?? availableChordRoots[0] ?? 0;
  const availableChordQualities = useMemo(
    () => resolveChordQualitiesForRoot(chordRootForOptions),
    [chordRootForOptions, resolveChordQualitiesForRoot],
  );

  useEffect(() => {
    if (!appState.chord) {
      return;
    }

    const currentRoot = appState.chord.rootPitchClass;
    const rootIsAllowed = availableChordRoots.includes(currentRoot);
    const nextRoot = rootIsAllowed ? currentRoot : availableChordRoots[0] ?? currentRoot;
    const qualitiesForRoot = resolveChordQualitiesForRoot(nextRoot);
    const qualityIsAllowed = qualitiesForRoot.includes(appState.chord.quality);
    const nextQuality = qualityIsAllowed
      ? appState.chord.quality
      : qualitiesForRoot[0] ?? appState.chord.quality;

    if (nextRoot === currentRoot && nextQuality === appState.chord.quality) {
      return;
    }

    setAppState((previous) => {
      if (!previous.chord) {
        return previous;
      }

      return {
        ...previous,
        chord: {
          ...previous.chord,
          rootPitchClass: nextRoot,
          quality: nextQuality,
        },
      };
    });
  }, [appState.chord, availableChordRoots, resolveChordQualitiesForRoot]);

  const handleReset = () => {
    setAppState(createInitialAppState());
    setViewState(createInitialViewFilterState());
  };

  const handleChordEnabledChange = (enabled: boolean) => {
    setAppState((previous) => {
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
      const qualities = previous.keyScale
        ? getDiatonicChordQualitiesForRoot(
            previous.keyScale.rootPitchClass,
            previous.keyScale.scaleType,
            rootPitchClass,
          )
        : CHORD_QUALITY_OPTIONS;
      const quality = qualities[0] ?? CHORD_QUALITY_OPTIONS[0];

      return {
        ...previous,
        chord: {
          rootPitchClass,
          quality,
          extensions: [],
          alterations: [],
        },
      };
    });
  };

  const handleChordRootChange = (rootPitchClass: PitchClass) => {
    setAppState((previous) => {
      if (!previous.chord) {
        return previous;
      }

      const qualities = previous.keyScale
        ? getDiatonicChordQualitiesForRoot(
            previous.keyScale.rootPitchClass,
            previous.keyScale.scaleType,
            rootPitchClass,
          )
        : CHORD_QUALITY_OPTIONS;
      const quality = qualities.includes(previous.chord.quality)
        ? previous.chord.quality
        : qualities[0] ?? CHORD_QUALITY_OPTIONS[0];

      return {
        ...previous,
        chord: {
          ...previous.chord,
          rootPitchClass,
          quality,
        },
      };
    });
  };

  const handleChordQualityChange = (quality: ChordQuality) => {
    setAppState((previous) => {
      if (!previous.chord) {
        return previous;
      }

      return {
        ...previous,
        chord: {
          ...previous.chord,
          quality,
        },
      };
    });
  };

  const handleChordExtensionToggle = (extension: ChordExtension) => {
    setAppState((previous) => {
      if (!previous.chord) {
        return previous;
      }

      const extensionSet = new Set(previous.chord.extensions);
      if (extensionSet.has(extension)) {
        extensionSet.delete(extension);
      } else {
        extensionSet.add(extension);
      }

      return {
        ...previous,
        chord: {
          ...previous.chord,
          extensions: CHORD_EXTENSION_OPTIONS.filter((item) =>
            extensionSet.has(item),
          ),
        },
      };
    });
  };

  const handleIncludeIntervalToggle = (interval: IntervalName) => {
    setAppState((previous) => ({
      ...previous,
      includeIntervals: toggleInterval(previous.includeIntervals, interval),
      excludeIntervals: previous.excludeIntervals.filter(
        (current) => current !== interval,
      ),
    }));
  };

  const handleExcludeIntervalToggle = (interval: IntervalName) => {
    setAppState((previous) => ({
      ...previous,
      includeIntervals: previous.includeIntervals.filter(
        (current) => current !== interval,
      ),
      excludeIntervals: toggleInterval(previous.excludeIntervals, interval),
    }));
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

  const derivedState = useMemo(
    () => deriveFretboardState(appState, viewState),
    [appState, viewState],
  );
  const allowedNotes = useMemo(
    () => computeAllowedNoteNames(appState),
    [appState],
  );
  const stateSummary = useMemo(() => buildStateSummary(appState), [appState]);
  const viewSummary = `Frets ${viewState.minFret}-${viewState.maxFret} | Strings ${
    viewState.enabledStringIndices.length
  }/6`;

  return (
    <main className="app-shell">
      <div className="ambient-glow" aria-hidden="true" />
      <section className="workspace-card">
        <StateSummaryBar
          summary="Fretboard Filter"
          detail={stateSummary}
          allowedNotes={allowedNotes}
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
            chordQualityOptions={availableChordQualities}
            onNoteNamingChange={(policy) =>
              setAppState((previous) => ({
                ...previous,
                noteNamingPolicy: policy,
              }))
            }
            onKeyEnabledChange={(enabled) =>
              setAppState((previous) => ({
                ...previous,
                keyScale: enabled
                  ? previous.keyScale ?? { rootPitchClass: 0, scaleType: "major" }
                  : null,
              }))
            }
            onKeyRootChange={(rootPitchClass) =>
              setAppState((previous) => ({
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
              setAppState((previous) => ({
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
            onChordQualityChange={handleChordQualityChange}
            onChordExtensionToggle={handleChordExtensionToggle}
            onIncludeIntervalToggle={handleIncludeIntervalToggle}
            onExcludeIntervalToggle={handleExcludeIntervalToggle}
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
          />
        </section>
      </section>
    </main>
  );
}

export default App;
