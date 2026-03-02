export function VisualLegend() {
  return (
    <section className="legend-panel" aria-label="Fretboard legend">
      <p className="legend-title">Visual Legend</p>
      <div className="legend-grid">
        <div className="legend-item">
          <span className="legend-swatch root" />
          Root tone
        </div>
        <div className="legend-item">
          <span className="legend-swatch chord" />
          Chord tone
        </div>
        <div className="legend-item">
          <span className="legend-swatch allowed" />
          Scale/Allowed tone
        </div>
        <div className="legend-item">
          <span className="legend-swatch muted" />
          Filtered out tone
        </div>
        <div className="legend-item">
          <span className="legend-swatch open" />
          Open string
        </div>
        <div className="legend-item">
          <span className="legend-swatch octave" />
          12th fret octave
        </div>
      </div>
    </section>
  );
}
