import type { ReactNode } from "react";

interface StateSummaryBarProps {
  summary: string;
  detail: string;
  allowedNotes: readonly string[];
  children?: ReactNode;
}

export function StateSummaryBar({
  summary,
  detail,
  allowedNotes,
  children,
}: StateSummaryBarProps) {
  return (
    <header className="state-summary">
      <div className="state-summary-text">
        <p className="state-summary-label">Milestone 2 Demo</p>
        <h1>{summary}</h1>
        <p className="state-summary-detail">{detail}</p>
      </div>
      <div className="state-summary-right">
        <p className="state-summary-notes-label">Allowed Notes</p>
        <div className="state-summary-notes">
          {allowedNotes.map((note) => (
            <span key={note} className="note-chip">
              {note}
            </span>
          ))}
        </div>
        {children}
      </div>
    </header>
  );
}
