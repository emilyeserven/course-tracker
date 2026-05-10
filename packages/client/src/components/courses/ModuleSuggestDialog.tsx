import type {
  ModuleSuggestion,
  SuggestedModule,
  SuggestedModuleGroup,
} from "@/utils/fetchFunctions";

import { useEffect, useMemo, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { Loader2, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createModule,
  createModuleGroup,
  suggestModulesForResource,
} from "@/utils/fetchFunctions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: string;
  resourceName: string;
  onApplied: () => void;
}

interface GroupSelection {
  selected: boolean;
  modules: boolean[];
}

interface SelectionState {
  groups: GroupSelection[];
  ungrouped: boolean[];
}

function buildSelection(suggestion: ModuleSuggestion): SelectionState {
  return {
    groups: suggestion.moduleGroups.map(g => ({
      selected: true,
      modules: g.modules.map(() => true),
    })),
    ungrouped: suggestion.ungroupedModules.map(() => true),
  };
}

function lengthLabel(length: string | null): string {
  if (!length) return "";
  switch (length) {
    case "extra_short":
      return "<5m";
    case "short":
      return "5–15m";
    case "medium":
      return "15–30m";
    case "long":
      return "30m–1h";
    case "extra_long":
      return "1h+";
    default: {
      const n = Number(length);
      if (Number.isFinite(n) && n > 0) return `${n}m`;
      return length;
    }
  }
}

export function ModuleSuggestDialog({
  open,
  onOpenChange,
  resourceId,
  resourceName,
  onApplied,
}: Props) {
  const [notes, setNotes] = useState("");
  const [suggestion, setSuggestion] = useState<ModuleSuggestion | null>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setNotes("");
      setSuggestion(null);
      setSelection(null);
      setApplyError(null);
    }
  }, [open]);

  const generate = useMutation({
    mutationFn: () =>
      suggestModulesForResource(resourceId, notes.trim() || null),
    onSuccess: (data) => {
      setSuggestion(data);
      setSelection(buildSelection(data));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalSelected = useMemo(() => {
    if (!selection) {
      return {
        groups: 0,
        modules: 0,
      };
    }
    let groupCount = 0;
    let moduleCount = 0;
    for (const g of selection.groups) {
      if (g.selected) groupCount += 1;
      moduleCount += g.modules.filter(Boolean).length;
    }
    moduleCount += selection.ungrouped.filter(Boolean).length;
    return {
      groups: groupCount,
      modules: moduleCount,
    };
  }, [selection]);

  const apply = useMutation({
    mutationFn: async () => {
      if (!suggestion || !selection) {
        throw new Error("No suggestion to apply");
      }
      let groupsCreated = 0;
      let modulesCreated = 0;
      const errors: string[] = [];

      for (let gi = 0; gi < suggestion.moduleGroups.length; gi++) {
        const g = suggestion.moduleGroups[gi];
        const sel = selection.groups[gi];
        if (!sel) continue;
        const wantsGroup = sel.selected;
        const selectedModules = g.modules.filter((_, mi) => sel.modules[mi]);
        if (!wantsGroup && selectedModules.length === 0) continue;

        let groupId: string | null = null;
        if (wantsGroup) {
          try {
            const result = await createModuleGroup(
              groupPayload(resourceId, g),
            );
            groupId = result.id;
            groupsCreated += 1;
          }
          catch (err) {
            errors.push(
              `Failed to create group "${g.name}": ${err instanceof Error ? err.message : String(err)}`,
            );
            continue;
          }
        }

        for (const m of selectedModules) {
          try {
            await createModule(modulePayload(resourceId, m, groupId));
            modulesCreated += 1;
          }
          catch (err) {
            errors.push(
              `Failed to create module "${m.name}": ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }
      }

      for (let mi = 0; mi < suggestion.ungroupedModules.length; mi++) {
        if (!selection.ungrouped[mi]) continue;
        const m = suggestion.ungroupedModules[mi];
        try {
          await createModule(modulePayload(resourceId, m, null));
          modulesCreated += 1;
        }
        catch (err) {
          errors.push(
            `Failed to create module "${m.name}": ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      return {
        groupsCreated,
        modulesCreated,
        errors,
      };
    },
    onSuccess: ({
      groupsCreated, modulesCreated, errors,
    }) => {
      if (errors.length > 0) {
        setApplyError(errors.join("\n"));
        if (groupsCreated > 0 || modulesCreated > 0) {
          toast.warning(
            `Created ${groupsCreated} group(s) and ${modulesCreated} module(s); ${errors.length} failed.`,
          );
        }
        else {
          toast.error("Failed to create any modules — see details below.");
        }
        return;
      }
      toast.success(
        `Created ${groupsCreated} group(s) and ${modulesCreated} module(s).`,
      );
      onApplied();
      onOpenChange(false);
    },
    onError: (e: Error) => {
      setApplyError(e.message);
    },
  });

  function toggleGroupSelected(gi: number) {
    setSelection((prev) => {
      if (!prev) return prev;
      const groups = prev.groups.slice();
      groups[gi] = {
        ...groups[gi],
        selected: !groups[gi].selected,
      };
      return {
        ...prev,
        groups,
      };
    });
  }

  function toggleGroupModule(gi: number, mi: number) {
    setSelection((prev) => {
      if (!prev) return prev;
      const groups = prev.groups.slice();
      const modules = groups[gi].modules.slice();
      modules[mi] = !modules[mi];
      groups[gi] = {
        ...groups[gi],
        modules,
      };
      return {
        ...prev,
        groups,
      };
    });
  }

  function toggleUngrouped(mi: number) {
    setSelection((prev) => {
      if (!prev) return prev;
      const ungrouped = prev.ungrouped.slice();
      ungrouped[mi] = !ungrouped[mi];
      return {
        ...prev,
        ungrouped,
      };
    });
  }

  function selectAll(value: boolean) {
    setSelection((prev) => {
      if (!prev) return prev;
      return {
        groups: prev.groups.map(g => ({
          selected: value,
          modules: g.modules.map(() => value),
        })),
        ungrouped: prev.ungrouped.map(() => value),
      };
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="max-h-[90vh] max-w-3xl overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="size-4" />
            {`LLM Assist — Modules for "${resourceName}"`}
          </DialogTitle>
          <DialogDescription>
            Use Claude to propose a structured outline of module groups and
            modules. Review the suggestions and pick which ones to add.
          </DialogDescription>
        </DialogHeader>

        {!suggestion && (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">
                Notes for the model (optional)
              </span>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. only cover the first 5 chapters, or focus on the hands-on exercises"
                rows={3}
              />
              <span className="text-xs text-muted-foreground">
                Claude already sees the resource name, description, URL,
                provider, topics, and any modules you&apos;ve already added.
              </span>
            </label>
            <div className="flex flex-row justify-end gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={() => generate.mutate()}
                disabled={generate.isPending}
              >
                {generate.isPending && <Loader2 className="animate-spin" />}
                <SparklesIcon className="size-4" />
                Generate Suggestions
              </Button>
            </div>
          </div>
        )}

        {suggestion && selection && (
          <div className="flex flex-col gap-3">
            {suggestion.notes && (
              <p
                className={`
                  rounded-md border border-amber-300 bg-amber-50 p-2 text-xs
                  text-amber-900
                  dark:border-amber-700/60 dark:bg-amber-900/30
                  dark:text-amber-200
                `}
              >
                {suggestion.notes}
              </p>
            )}

            <div className="flex flex-row items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {totalSelected.groups}
                {" "}
                group(s) and
                {" "}
                {totalSelected.modules}
                {" "}
                module(s) selected
              </p>
              <div className="flex flex-row gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => selectAll(true)}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => selectAll(false)}
                >
                  Clear
                </Button>
              </div>
            </div>

            {suggestion.moduleGroups.map((g, gi) => (
              <SuggestionGroupCard
                key={`g-${gi}`}
                group={g}
                groupSelected={selection.groups[gi].selected}
                modulesSelected={selection.groups[gi].modules}
                onToggleGroup={() => toggleGroupSelected(gi)}
                onToggleModule={mi => toggleGroupModule(gi, mi)}
              />
            ))}

            {suggestion.ungroupedModules.length > 0 && (
              <div
                className="
                  flex flex-col gap-2 rounded-md border bg-background p-3
                "
              >
                <h3 className="text-sm font-medium">Ungrouped modules</h3>
                <ul className="flex flex-col divide-y rounded-sm border">
                  {suggestion.ungroupedModules.map((m, mi) => (
                    <ModuleRow
                      key={`u-${mi}`}
                      module={m}
                      checked={selection.ungrouped[mi]}
                      onToggle={() => toggleUngrouped(mi)}
                    />
                  ))}
                </ul>
              </div>
            )}

            {applyError && (
              <pre
                className={`
                  max-h-32 overflow-auto rounded-md border border-destructive
                  bg-destructive/10 p-2 text-xs whitespace-pre-wrap
                  text-destructive
                `}
              >
                {applyError}
              </pre>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSuggestion(null);
                  setSelection(null);
                  setApplyError(null);
                }}
                disabled={apply.isPending}
              >
                Regenerate
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={apply.isPending}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={() => {
                  setApplyError(null);
                  apply.mutate();
                }}
                disabled={
                  apply.isPending
                  || (totalSelected.groups === 0 && totalSelected.modules === 0)
                }
              >
                {apply.isPending && <Loader2 className="animate-spin" />}
                Add Selected
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function groupPayload(
  resourceId: string,
  g: SuggestedModuleGroup,
): Record<string, unknown> {
  return {
    resourceId,
    name: g.name,
    description: g.description ?? null,
    url: g.url ?? null,
    totalCount: null,
    completedCount: null,
    easeOfStarting: null,
    timeNeeded: null,
    interactivity: null,
    tagIds: [],
  };
}

function modulePayload(
  resourceId: string,
  m: SuggestedModule,
  moduleGroupId: string | null,
): Record<string, unknown> {
  return {
    resourceId,
    moduleGroupId,
    name: m.name,
    description: m.description ?? null,
    url: m.url ?? null,
    length: m.length ?? null,
    isComplete: false,
    easeOfStarting: null,
    timeNeeded: null,
    interactivity: null,
    tagIds: [],
  };
}

function SuggestionGroupCard({
  group,
  groupSelected,
  modulesSelected,
  onToggleGroup,
  onToggleModule,
}: {
  group: SuggestedModuleGroup;
  groupSelected: boolean;
  modulesSelected: boolean[];
  onToggleGroup: () => void;
  onToggleModule: (mi: number) => void;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-md border bg-background p-3"
    >
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={groupSelected}
          onChange={onToggleGroup}
          className="mt-1 size-4"
        />
        <span className="flex flex-col gap-0.5">
          <span className="font-medium">{group.name}</span>
          {group.description && (
            <span className="text-xs text-muted-foreground">
              {group.description}
            </span>
          )}
          {!groupSelected && (
            <span className="text-xs text-muted-foreground italic">
              Group skipped — selected modules below will be created without
              this group.
            </span>
          )}
        </span>
      </label>
      {group.modules.length > 0 && (
        <ul className="flex flex-col divide-y rounded-sm border">
          {group.modules.map((m, mi) => (
            <ModuleRow
              key={`m-${mi}`}
              module={m}
              checked={modulesSelected[mi]}
              onToggle={() => onToggleModule(mi)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ModuleRow({
  module: m,
  checked,
  onToggle,
}: {
  module: SuggestedModule;
  checked: boolean;
  onToggle: () => void;
}) {
  const length = lengthLabel(m.length);
  return (
    <li className="flex items-start gap-2 px-2 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-1 size-4"
      />
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm">
          {m.name}
          {length && (
            <span className="ml-2 text-xs text-muted-foreground">
              {length}
            </span>
          )}
        </span>
        {m.description && (
          <span className="text-xs text-muted-foreground">{m.description}</span>
        )}
      </span>
    </li>
  );
}
