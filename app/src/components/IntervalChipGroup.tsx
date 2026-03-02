import type { IntervalName } from "@core";

interface IntervalChipGroupProps {
  title: string;
  intervals: readonly IntervalName[];
  selected: readonly IntervalName[];
  disabledIntervals?: readonly IntervalName[];
  onToggle: (interval: IntervalName) => void;
}

export function IntervalChipGroup({
  title,
  intervals,
  selected,
  disabledIntervals = [],
  onToggle,
}: IntervalChipGroupProps) {
  const selectedSet = new Set(selected);
  const disabledSet = new Set(disabledIntervals);

  return (
    <div className="chip-group" role="group" aria-label={title}>
      <p className="chip-group-title">{title}</p>
      <div className="chip-grid">
        {intervals.map((interval) => {
          const isActive = selectedSet.has(interval);
          const isDisabled = disabledSet.has(interval) && !isActive;
          return (
            <button
              key={interval}
              type="button"
              className={`chip ${isActive ? "is-active" : ""} ${
                isDisabled ? "is-disabled" : ""
              }`}
              onClick={() => onToggle(interval)}
              disabled={isDisabled}
              aria-pressed={isActive}
            >
              {interval}
            </button>
          );
        })}
      </div>
    </div>
  );
}
