import type { DashboardTileProps } from "@/lib/dashboardTiles";
import type { TileHeightMode } from "@emstack/types";
import type * as React from "react";

import { useEffect, useRef, useState } from "react";

import { SettingsIcon } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { Input } from "@/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";
import { RadioGroupItem } from "@/components/radio-group";
import { Button } from "@/components/ui/button";
import { MAX_TILE_ROWS, TILE_META } from "@/lib/dashboardTiles";
import { cn } from "@/lib/utils";

/** Auto / Fixed height chooser shared by every card's settings flyout. When
 * "Fixed" is selected, a numeric input lets the user set the height (in grid
 * rows) directly, as a precise alternative to the resize handle. */
function TileHeightSettings({
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

/**
 * A label + switch-style toggle row. No Switch primitive exists in the repo, so
 * this is a self-contained accessible toggle built from a button.
 */
function SettingToggle({
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

/**
 * The gear-icon flyout shown at the right of a card header. Always offers the
 * Auto/Fixed height choice; `children` add card-specific controls (e.g. the
 * Todoist display toggles or a link to Settings).
 */
function CardSettingsFlyout({
  tile,
  onUpdateTile,
  children,
}: DashboardTileProps & { children?: React.ReactNode }) {
  const mode = tile.heightMode ?? "auto";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Card settings"
        >
          <SettingsIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex flex-col gap-3"
      >
        <TileHeightSettings
          mode={mode}
          onChange={heightMode => onUpdateTile({
            heightMode,
          })}
          h={tile.h}
          minH={TILE_META[tile.tileId].minH}
          maxH={MAX_TILE_ROWS}
          onHeightChange={h => onUpdateTile({
            h,
          })}
        />
        {children}
      </PopoverContent>
    </Popover>
  );
}

export { CardSettingsFlyout, SettingToggle };
