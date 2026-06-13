import type { DashboardTileProps } from "./-dashboardTileMeta";
import type { TileHeightMode } from "@emstack/types";
import type * as React from "react";

import { SettingsIcon } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";
import { RadioGroupItem } from "@/components/radio-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Auto / Fixed height chooser shared by every card's settings flyout. */
function TileHeightSettings({
  mode,
  onChange,
}: {
  mode: TileHeightMode;
  onChange: (mode: TileHeightMode) => void;
}) {
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
        />
        {children}
      </PopoverContent>
    </Popover>
  );
}

export { CardSettingsFlyout, SettingToggle, TileHeightSettings };
