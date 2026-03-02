import type { IntervalName } from "@core";

interface IntervalChipGroupProps {
  title: string;
  intervals: readonly IntervalName[];
  selected: readonly IntervalName[];
  onToggle: (interval: IntervalName) => void;
}

export function IntervalChipGroup({
  title,
  intervals,
  selected,
  onToggle,
}: IntervalChipGroupProps) {
  const selectedSet = new Set(selected);

  return (
    <div className="chip-group">
      <p className="chip-group-title">{title}</p>
      <div className="chip-grid">
        {intervals.map((interval) => {
          const isActive = selectedSet.has(interval);
          return (
            <button
              key={interval}
              type="button"
              className={`chip ${isActive ? "is-active" : ""}`}
              onClick={() => onToggle(interval)}
            >
              {interval}
            </button>
          );
        })}
      </div>
    </div>
  );
}
