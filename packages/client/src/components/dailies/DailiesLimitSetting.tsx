import type { WeekTargetWindow } from "@/context/SettingsProviderContext";

import { useState } from "react";

import { SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WEEK_TARGET_WINDOWS } from "@/context/SettingsProviderContext";
import { useSettings } from "@/hooks/useSettings";

const WEEK_WINDOW_LABELS: Record<WeekTargetWindow, string> = {
  sunday: "Week starts Sunday",
  monday: "Week starts Monday",
  rolling7: "Rolling 7 days",
};

export function DailiesLimitSetting() {
  const {
    settings, setMaxActiveDailies, setWeekTargetWindow,
  } = useSettings();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(settings.maxActiveDailies));

  function handleSave() {
    const value = Number(draft);
    if (Number.isFinite(value) && value > 0) {
      setMaxActiveDailies(value);
      setOpen(false);
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setDraft(String(settings.maxActiveDailies));
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Routine tracker settings"
          title="Routine tracker settings"
        >
          <SettingsIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72"
      >
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <label
            className="text-sm font-medium"
            htmlFor="active-dailies-limit"
          >
            Active dailies limit
          </label>
          <p className="text-xs text-muted-foreground">
            Show a warning when you have this many active dailies or more.
          </p>
          <Input
            id="active-dailies-limit"
            type="number"
            min={1}
            value={draft}
            onChange={e => setDraft(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
            >
              Save
            </Button>
          </div>
        </form>
        <div className="mt-3 flex flex-col gap-2 border-t pt-3">
          <label
            className="text-sm font-medium"
            htmlFor="week-target-window"
          >
            Weekly target reset
          </label>
          <p className="text-xs text-muted-foreground">
            How a daily routine&apos;s “days per week” target counts a week.
          </p>
          <Select
            value={settings.weekTargetWindow}
            onValueChange={value =>
              setWeekTargetWindow(value as WeekTargetWindow)}
          >
            <SelectTrigger
              id="week-target-window"
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WEEK_TARGET_WINDOWS.map(window => (
                <SelectItem
                  key={window}
                  value={window}
                >
                  {WEEK_WINDOW_LABELS[window]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
