import type { ResourceModulesController } from "@/hooks/useResourceModules";

import { useState } from "react";

import { DEFAULT_MODULES_CONFIG } from "@emstack/types";
import { TextCursorInputIcon } from "lucide-react";

import { Input } from "@/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";
import { Button } from "@/components/ui/button";

/**
 * Lets the user rename what a "group" and a "module" are called for this
 * specific resource (e.g. a Book might call them "Chapter" and "Section").
 * Saves straight to the resource via the dedicated modulesConfig endpoint.
 */
export function ModuleConventionsEditor({
  api,
}: {
  api: ResourceModulesController;
}) {
  const {
    modulesConfig, updateModulesConfigMutation, isBook,
  } = api;
  const [open, setOpen] = useState(false);
  const [groupLabel, setGroupLabel] = useState(modulesConfig.groupLabel);
  const [moduleLabel, setModuleLabel] = useState(modulesConfig.moduleLabel);

  function handleSave() {
    updateModulesConfigMutation.mutate(
      {
        groupLabel: groupLabel.trim() || DEFAULT_MODULES_CONFIG.groupLabel,
        moduleLabel: moduleLabel.trim() || DEFAULT_MODULES_CONFIG.moduleLabel,
      },
      {
        onSuccess: () => setOpen(false),
      },
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setGroupLabel(modulesConfig.groupLabel);
          setModuleLabel(modulesConfig.moduleLabel);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          title="Customize what a group and a module are called for this resource"
        >
          <TextCursorInputIcon className="size-4" />
          Naming
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72"
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <p className="text-xs text-muted-foreground">
            Rename the module hierarchy for this resource
            {isBook ? " (e.g. Chapter / Section for a book)" : ""}
            .
          </p>
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="group-label"
            >
              What do you call a group?
            </label>
            <Input
              id="group-label"
              type="text"
              value={groupLabel}
              onChange={e => setGroupLabel(e.target.value)}
              placeholder={DEFAULT_MODULES_CONFIG.groupLabel}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="module-label"
            >
              What do you call a module?
            </label>
            <Input
              id="module-label"
              type="text"
              value={moduleLabel}
              onChange={e => setModuleLabel(e.target.value)}
              placeholder={DEFAULT_MODULES_CONFIG.moduleLabel}
            />
          </div>
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
              disabled={updateModulesConfigMutation.isPending}
            >
              Save
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
