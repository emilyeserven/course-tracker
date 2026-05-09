import { useState } from "react";

import { SettingsIcon } from "lucide-react";

import { Input } from "@/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";

export function DailiesLimitSetting() {
  const {
    settings, setMaxActiveDailies,
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
          aria-label="Configure active dailies limit"
          title="Configure active dailies limit"
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
          <p className="text-muted-foreground text-xs">
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
      </PopoverContent>
    </Popover>
  );
}
