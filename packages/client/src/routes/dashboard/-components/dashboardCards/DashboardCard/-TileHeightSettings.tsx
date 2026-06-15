import type { TileHeightMode } from "@emstack/types";

import { useEffect, useRef, useState } from "react";

import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { Input } from "@/components/ui/input";
import { RadioGroupItem } from "@/components/ui/radio-group";

/** Auto / Fixed height chooser shared by every card's settings flyout. When
 * "Fixed" is selected, a numeric input lets the user set the height (in grid
 * rows) directly, as a precise alternative to the resize handle. */
export function TileHeightSettings({
  mode,
  onChange,
  h,
  minH,
  maxH,
  onHeightChange,
}: {
  mode: TileHeightMode;
  onChange: (mode: TileHeightMode) => void;
  h: number;
  minH: number;
  maxH: number;
  onHeightChange: (h: number) => void;
}) {
  // Hold the field as a string so the user can clear it / type a partial value
  // without pushing a bad height. The committed value flows back on blur/Enter.
  const [draft, setDraft] = useState(String(h));
  const focusedRef = useRef(false);

  // Reflect external height changes (e.g. dragging the resize handle) unless the
  // user is mid-edit, so we never clobber what they're typing.
  useEffect(() => {
    if (!focusedRef.current) setDraft(String(h));
  }, [h]);

  const commit = () => {
    const parsed = Math.round(Number(draft));
    const next = Number.isFinite(parsed)
      ? Math.min(maxH, Math.max(minH, parsed))
      : h;
    if (next !== h) onHeightChange(next);
    setDraft(String(next));
  };

  return (
    <div className="flex flex-col gap-2">
      <span
        className="
          text-xs font-semibold tracking-wide text-muted-foreground uppercase
        "
      >
        Height
      </span>
      <RadioGroupPrimitive.Root
        className="grid gap-2"
        value={mode}
        onValueChange={value => onChange(value as TileHeightMode)}
      >
        <label className="flex items-center gap-2 text-sm">
          <RadioGroupItem value="auto" />
          Auto (fit content)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <RadioGroupItem value="fixed" />
          Fixed (resize handle)
        </label>
      </RadioGroupPrimitive.Root>
      {mode === "fixed" && (
        <label className="flex items-center gap-2 text-sm">
          <Input
            type="number"
            min={minH}
            max={maxH}
            step={1}
            value={draft}
            className="h-8 w-20"
            onFocus={() => {
              focusedRef.current = true;
            }}
            onChange={e => setDraft(e.target.value)}
            onBlur={() => {
              focusedRef.current = false;
              commit();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
          <span className="text-xs text-muted-foreground">rows</span>
        </label>
      )}
    </div>
  );
}
