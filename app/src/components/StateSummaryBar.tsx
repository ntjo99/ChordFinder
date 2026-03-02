import type { ReactNode } from "react";

interface StateSummaryBarProps {
  summary: string;
  detail: string;
  allowedNotes: readonly string[];
  status: string;
  onReset: () => void;
  children?: ReactNode;
}

export function StateSummaryBar({
  summary,
  detail,
  allowedNotes,
  status,
  onReset,
  children,
}: StateSummaryBarProps) {
  return (
    <header className="state-summary">
      <div className="state-summary-text">
        <h1>{summary}</h1>
        <p className="state-summary-detail">{detail}</p>
        <p className="state-summary-status">{status}</p>
      </div>
      <div className="state-summary-right">
        <p className="state-summary-notes-label">Allowed Notes</p>
        <div className="state-summary-notes" aria-live="polite">
          {allowedNotes.length > 0 ? (
            allowedNotes.map((note) => (
              <span key={note} className="note-chip">
                {note}
              </span>
            ))
          ) : (
            <span className="note-chip note-chip-empty">None</span>
          )}
        </div>
        {children}
        <button type="button" className="reset-button" onClick={onReset}>
          Reset
        </button>
      </div>
    </header>
  );
}
