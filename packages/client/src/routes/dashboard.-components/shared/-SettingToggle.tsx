import { cn } from "@/lib/utils";

/**
 * A label + switch-style toggle row. No Switch primitive exists in the repo, so
 * this is a self-contained accessible toggle built from a button.
 */
export function SettingToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 text-sm"
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-input",
        )}
      >
        <span
          className={cn(
            `
              absolute top-0.5 left-0.5 size-4 rounded-full bg-background
              shadow-sm transition-transform
            `,
            checked && "translate-x-4",
          )}
        />
      </span>
    </button>
  );
}
