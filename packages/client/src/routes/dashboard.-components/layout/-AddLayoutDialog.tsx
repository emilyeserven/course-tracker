import type { ControlledDialogProps } from "@/types/dialogProps";
import type { DashboardLayout, DashboardLayoutTile } from "@emstack/types";

import { useEffect, useMemo, useState } from "react";

import { LAYOUT_PRESETS } from "./-layoutPresets";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddLayoutDialogProps extends ControlledDialogProps {
  isSaving?: boolean;
  /** User-saved presets (template layouts) offered as starting points. */
  savedPresets: DashboardLayout[];
  onSubmit: (name: string, tiles: DashboardLayoutTile[]) => void;
}

interface StartingOption {
  value: string;
  label: string;
  description?: string;
  suggestedName: string;
  getTiles: () => DashboardLayoutTile[];
}

/**
 * Add-tab dialog: pick a name and a starting layout ("predone layout") — Blank,
 * a curated built-in, or any saved preset — then create the tab from its tiles.
 */
export function AddLayoutDialog({
  open,
  isSaving = false,
  savedPresets,
  onOpenChange,
  onSubmit,
}: AddLayoutDialogProps) {
  const options = useMemo<StartingOption[]>(() => {
    const builtIns = LAYOUT_PRESETS.map(preset => ({
      value: `builtin:${preset.key}`,
      label: preset.name,
      description: preset.description,
      suggestedName: preset.name,
      getTiles: preset.buildTiles,
    }));
    const saved = savedPresets.map(preset => ({
      value: `preset:${preset.id}`,
      label: preset.name,
      description: `${preset.tiles.length} tile(s)`,
      suggestedName: preset.name,
      getTiles: () => preset.tiles,
    }));
    return [...builtIns, ...saved];
  }, [savedPresets]);

  const [value, setValue] = useState(options[0]?.value ?? "");
  const [name, setName] = useState("");
  // Stop syncing the name from the selection once the user types their own.
  const [nameTouched, setNameTouched] = useState(false);

  const selected = options.find(o => o.value === value) ?? options[0];

  // Reset to a clean state each time the dialog opens.
  useEffect(() => {
    if (open) {
      const first = options[0];
      setValue(first?.value ?? "");
      setName(first?.suggestedName ?? "");
      setNameTouched(false);
    }
  }, [open, options]);

  const handleSelect = (next: string) => {
    setValue(next);
    if (!nameTouched) {
      const option = options.find(o => o.value === next);
      if (option) setName(option.suggestedName);
    }
  };

  const trimmed = name.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add layout</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed && selected) onSubmit(trimmed, selected.getTiles());
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Start from</label>
            <Select
              value={value}
              onValueChange={handleSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a starting layout" />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected?.description && (
              <p className="text-xs text-muted-foreground">
                {selected.description}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input
              autoFocus
              value={name}
              placeholder="Layout name"
              onChange={(e) => {
                setName(e.target.value);
                setNameTouched(true);
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!trimmed || isSaving}
            >
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
