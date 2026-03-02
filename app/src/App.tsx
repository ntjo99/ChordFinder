import { computeAllowedNoteNames } from "@core";
import { useMemo, useState } from "react";
import { FretboardView } from "./components/FretboardView";
import { StateSummaryBar } from "./components/StateSummaryBar";
import "./App.css";
import { getPresetById, milestone2Presets } from "./state/appStateStore";
import { buildStateSummary, deriveFretboardState } from "./state/derivedSelectors";

function App() {
  const [activePresetId, setActivePresetId] = useState(milestone2Presets[0]!.id);
  const activePreset = getPresetById(activePresetId);
  const derivedState = useMemo(
    () => deriveFretboardState(activePreset.state),
    [activePreset],
  );
  const allowedNotes = useMemo(
    () => computeAllowedNoteNames(activePreset.state),
    [activePreset],
  );
  const stateSummary = useMemo(
    () => buildStateSummary(activePreset.state),
    [activePreset],
  );

  return (
    <main className="app-shell">
      <div className="ambient-glow" aria-hidden="true" />
      <section className="workspace-card">
        <StateSummaryBar
          summary="Fretboard Filter"
          detail={`${activePreset.label}: ${activePreset.description}`}
          allowedNotes={allowedNotes}
        >
          <p className="state-summary-inline">{stateSummary}</p>
        </StateSummaryBar>

        <nav className="preset-group" aria-label="Milestone 2 presets">
          {milestone2Presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`preset-button ${
                preset.id === activePresetId ? "is-active" : ""
              }`}
              onClick={() => setActivePresetId(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </nav>

        <section className="fretboard-frame">
          <FretboardView state={derivedState} />
        </section>
      </section>
    </main>
  );
}

export default App;
