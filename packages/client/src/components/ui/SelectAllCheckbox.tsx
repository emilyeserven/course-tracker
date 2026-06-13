interface SelectAllCheckboxProps {
  "checked": boolean;
  /**
   * Whether to show the partial (dash) state. Call sites compute this
   * differently — some as `!allSelected && someSelected`, some as a plain
   * `someSelected` — so it's an explicit prop rather than derived here.
   */
  "indeterminate": boolean;
  "onCheckedChange": (checked: boolean) => void;
  "aria-label": string;
  "disabled"?: boolean;
  "className"?: string;
}

/**
 * A "select all" header checkbox. The native `indeterminate` flag can only be
 * set imperatively, so it's applied via a ref callback.
 */
export function SelectAllCheckbox({
  checked,
  indeterminate,
  onCheckedChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: SelectAllCheckboxProps) {
  return (
    <input
      type="checkbox"
      className={className}
      aria-label={ariaLabel}
      checked={checked}
      disabled={disabled}
      ref={(el) => {
        if (el) {
          el.indeterminate = indeterminate;
        }
      }}
      onChange={e => onCheckedChange(e.target.checked)}
    />
  );
}
