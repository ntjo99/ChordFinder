export interface ToggleItem {
  id: string;
  label: string;
  disabled?: boolean;
}

interface ToggleGroupProps {
  items: readonly ToggleItem[];
  selectedIds: readonly string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function ToggleGroup({
  items,
  selectedIds,
  onToggle,
  disabled = false,
  ariaLabel,
}: ToggleGroupProps) {
  const selectedSet = new Set(selectedIds);

  return (
    <div className="toggle-grid" role="group" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = selectedSet.has(item.id);
        const isDisabled = disabled || item.disabled === true;
        return (
          <button
            key={item.id}
            type="button"
            className={`toggle-pill ${isActive ? "is-active" : ""}`}
            onClick={() => onToggle(item.id)}
            disabled={isDisabled}
            aria-pressed={isActive}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
