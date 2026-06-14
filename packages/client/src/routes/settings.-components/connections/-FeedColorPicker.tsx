// A few preset swatches so multiple feeds get distinguishable dots on the card.
export const FEED_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#d97706",
  "#7c3aed",
];

interface FeedColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function FeedColorPicker({
  value, onChange,
}: FeedColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Colour</span>
      {FEED_COLORS.map(c => (
        <button
          key={c}
          type="button"
          aria-label={`Use colour ${c}`}
          aria-pressed={value === c}
          onClick={() => onChange(c)}
          className={`
            size-5 rounded-full border-2
            ${value === c ? "border-foreground" : "border-transparent"}
          `}
          style={{
            backgroundColor: c,
          }}
        />
      ))}
    </div>
  );
}
