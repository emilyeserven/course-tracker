/**
 * Labeled `<select>` with an empty ("—") option, used for the optional
 * difficulty / understanding pickers in the interaction logging forms
 * (InteractionQuickLog and ResourceInteractionsLog).
 */
export function OptionalSelectField<T extends string>({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: T | "";
  options: readonly T[];
  onValueChange: (next: T | "") => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={e => onValueChange((e.target.value || "") as T | "")}
        className="
          flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm
        "
      >
        <option value="">—</option>
        {options.map(o => (
          <option
            key={o}
            value={o}
          >
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
