import type { ResourceModulesController } from "@/hooks/useResourceModules";

import { useEffect, useState } from "react";

import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// SelectItem can't take an empty value, so the "no template" choice uses a
// sentinel that maps back to null when saved.
const NONE_VALUE = "__none__";

interface ModuleHintTemplateDialogProps {
  api: ResourceModulesController;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Lets the user pick a saved hint template for this resource. The chosen
 * template's group/module hints surface as placeholder guidance in the
 * group/module name fields — it never renames the "Group"/"Module" labels.
 * Templates are managed in Settings → Resource Settings. Saves straight to the
 * resource via the dedicated modulesConfig endpoint. Launched from the module
 * admin "More" menu, so the open state is controlled by the caller.
 */
export function ModuleHintTemplateDialog({
  api,
  open,
  onOpenChange,
}: ModuleHintTemplateDialogProps) {
  const {
    modulesConfig, updateModulesConfigMutation, hintTemplates,
  } = api;
  const [selected, setSelected] = useState(
    modulesConfig.hintTemplateId ?? NONE_VALUE,
  );

  // Re-sync the selection to the saved value each time the dialog opens, so a
  // cancelled edit doesn't leak into the next open.
  useEffect(() => {
    if (open) {
      setSelected(modulesConfig.hintTemplateId ?? NONE_VALUE);
    }
  }, [open, modulesConfig.hintTemplateId]);

  function handleSave() {
    updateModulesConfigMutation.mutate(
      {
        hintTemplateId: selected === NONE_VALUE ? null : selected,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hints</DialogTitle>
          <DialogDescription>
            Pick a hint template to guide naming this resource&apos;s groups and
            modules. The hints show as placeholder examples — they don&apos;t
            rename anything.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {hintTemplates.length > 0
            ? (
              <Select
                value={selected}
                onValueChange={setSelected}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>None</SelectItem>
                  {hintTemplates.map(template => (
                    <SelectItem
                      key={template.id}
                      value={template.id}
                    >
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
            : (
              <p className="text-sm text-muted-foreground">
                No hint templates yet. Create them in
                {" "}
                <Link
                  to="/settings"
                  search={{
                    tab: "resources",
                  }}
                  className="font-medium underline"
                >
                  Settings → Resource Settings
                </Link>
                .
              </p>
            )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
