import type { ModuleAdminSectionProps } from "./-moduleAdminSectionProps";

import { ArrowUpDownIcon, PlusIcon, SparklesIcon } from "lucide-react";

import { ModuleAssistDialog } from "./-ModuleAssistDialog";
import { ModuleConventionsEditor } from "./-ModuleConventionsEditor";

import { Button } from "@/components/ui/button";
import { UNGROUPED_KEY } from "@/hooks/useModuleAdminUiState";

interface ModuleAdminHeaderProps extends ModuleAdminSectionProps {
  /** When true, render the editable "module list is exhaustive" toggle. */
  canEditExhaustive?: boolean;
}

/**
 * Top bar for the module admin: the progress summary, the LLM-assist / add /
 * new-group actions, and the (portalled) suggest dialog those actions drive.
 */
export function ModuleAdminHeader({
  resourceId,
  canEditExhaustive,
  api,
  ui,
}: ModuleAdminHeaderProps) {
  const {
    completedCount,
    totalCount,
    groupLabel,
    moduleLabel,
    modulesAreExhaustive,
    setModulesExhaustiveMutation,
  } = api;
  const {
    isAnyEditing,
    setLlmAssistOpen,
    setCreatingModuleIn,
    setCreatingGroup,
    reorderMode,
    setReorderMode,
  } = ui;

  const percentComplete
    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} complete
              {modulesAreExhaustive && <span> · {percentComplete}%</span>}
            </p>
          )}
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          <ModuleConventionsEditor api={api} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLlmAssistOpen(true)}
            disabled={isAnyEditing}
            title="Suggest module groups and modules via Claude"
          >
            <SparklesIcon className="size-4" />
            LLM Assist
          </Button>
          <Button
            variant={reorderMode ? "secondary" : "outline"}
            size="sm"
            onClick={() => setReorderMode(!reorderMode)}
            disabled={isAnyEditing}
            aria-pressed={reorderMode}
            title="Toggle reordering of groups and modules"
          >
            <ArrowUpDownIcon className="size-4" />
            Reorder
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreatingModuleIn(UNGROUPED_KEY)}
            disabled={isAnyEditing}
          >
            <PlusIcon className="size-4" />
            Add
            {" "}
            {moduleLabel}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreatingGroup(true)}
            disabled={isAnyEditing}
          >
            <PlusIcon className="size-4" />
            New
            {" "}
            {groupLabel}
          </Button>
        </div>
      </div>

      {canEditExhaustive && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={modulesAreExhaustive}
            onChange={e =>
              setModulesExhaustiveMutation.mutate(e.target.checked)}
            className="mt-0.5 size-4"
          />
          <span className="flex flex-col gap-0.5">
            <span className="font-medium">Module list is exhaustive</span>
            <span className="text-xs text-muted-foreground">
              Treat the modules below as the full contents of this resource. When
              on, progress and % complete are calculated from how many modules
              are marked done — instead of the Current Progress / Total Modules
              numbers on the Details tab. Leave off if these modules are only a
              partial breakdown.
            </span>
          </span>
        </label>
      )}

      <ModuleAssistDialog
        resourceId={resourceId}
        api={api}
        ui={ui}
      />
    </>
  );
}
