export interface ToggleItem {
  id: string;
  label: string;
}

interface ToggleGroupProps {
  items: readonly ToggleItem[];
  selectedIds: readonly string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export function ToggleGroup({
  items,
  selectedIds,
  onToggle,
  disabled = false,
}: ToggleGroupProps) {
  const selectedSet = new Set(selectedIds);

  return (
    <div className="toggle-grid">
      {items.map((item) => {
        const isActive = selectedSet.has(item.id);
        return (
          <button
            key={item.id}
            type="button"
            className={`toggle-pill ${isActive ? "is-active" : ""}`}
            onClick={() => onToggle(item.id)}
            disabled={disabled}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
