import type { ResourceModulesController } from "@/hooks/useResourceModules";

import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { TextCursorInputIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
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

// SelectItem can't take an empty value, so the "no template" choice uses a
// sentinel that maps back to null when saved.
const NONE_VALUE = "__none__";

/**
 * Lets the user pick a saved hint template for this resource. The chosen
 * template's group/module hints surface as placeholder guidance in the
 * group/module name fields — it never renames the "Group"/"Module" labels.
 * Templates are managed in Settings → Resource Settings. Saves straight to the
 * resource via the dedicated modulesConfig endpoint.
 */
export function ModuleHintTemplatePicker({
  api,
}: {
  api: ResourceModulesController;
}) {
  const {
    modulesConfig, updateModulesConfigMutation, hintTemplates,
  } = api;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(
    modulesConfig.hintTemplateId ?? NONE_VALUE,
  );

  function handleSave() {
    updateModulesConfigMutation.mutate(
      {
        hintTemplateId: selected === NONE_VALUE ? null : selected,
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
          setSelected(modulesConfig.hintTemplateId ?? NONE_VALUE);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          title="Pick a hint template to guide naming this resource's groups and modules"
        >
          <TextCursorInputIcon className="size-4" />
          Hints
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
            Pick a hint template to guide naming this resource&apos;s groups and
            modules. The hints show as placeholder examples — they don&apos;t
            rename anything.
          </p>
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
              <p className="text-xs text-muted-foreground">
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
