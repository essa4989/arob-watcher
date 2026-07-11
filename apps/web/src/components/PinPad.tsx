interface PinPadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function PinPad({ value, onChange, maxLength = 4 }: PinPadProps) {
  const press = (digit: string) => {
    if (digit === 'back') return onChange(value.slice(0, -1));
    if (value.length >= maxLength) return;
    onChange(value + digit);
  };

  return (
    <div>
      <div className="pin-dots">
        {Array.from({ length: maxLength }).map((_, i) => (
          <span key={i} className={i < value.length ? 'filled' : ''} />
        ))}
      </div>
      <div className="pin-pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((d, i) =>
          d === '' ? (
            <span key={i} />
          ) : (
            <button type="button" key={i} onClick={() => press(d)}>
              {d === 'back' ? '⌫' : d}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
