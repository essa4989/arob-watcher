interface ChipGroupProps {
  options: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
}

export function ChipGroup({ options, value, onChange }: ChipGroupProps) {
  return (
    <div className="chip-group">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`chip${value === opt ? ' selected' : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
