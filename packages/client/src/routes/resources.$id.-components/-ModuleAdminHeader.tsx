import type { ModuleAdminSectionProps } from "./-moduleAdminSectionProps";

import {
  ArrowUpDownIcon,
  CircleCheckBig,
  InfoIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react";

import { ModuleAssistDialog } from "./-ModuleAssistDialog";
import { ModuleConventionsEditor } from "./-ModuleConventionsEditor";

import { Button } from "@/components/ui/button";
import { UNGROUPED_KEY } from "@/hooks/useModuleAdminUiState";
import { cn } from "@/lib/utils";

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

      <div
        className={cn(
          "flex items-start gap-2 rounded-md border p-3 text-sm",
          modulesAreExhaustive
            ? `
              border-emerald-300 bg-emerald-50 text-emerald-900
              dark:border-emerald-500/40 dark:bg-emerald-900/30
              dark:text-emerald-100
            `
            : "border-border bg-muted/40",
        )}
      >
        {modulesAreExhaustive
          ? <CircleCheckBig className="mt-0.5 size-4 shrink-0" />
          : (
            <InfoIcon
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
          )}
        <span className="flex flex-col gap-0.5">
          <span className="font-medium">
            {modulesAreExhaustive
              ? `These ${moduleLabel.toLowerCase()}s are used to calculate `
              + "this resource's progress"
              : `These ${moduleLabel.toLowerCase()}s are not used to calculate `
                + "progress"}
          </span>
          <span
            className={cn("text-xs", !modulesAreExhaustive && `
              text-muted-foreground
            `)}
          >
            {modulesAreExhaustive
              ? "Progress and % complete come from how many are marked done."
              : "Progress is tracked manually with the Current Progress / Total "
                + "Modules numbers on the Details tab."}
            {canEditExhaustive
              && " Change this with \"How to calculate progress\" on the "
              + "Details tab."}
          </span>
        </span>
      </div>

      <ModuleAssistDialog
        resourceId={resourceId}
        api={api}
        ui={ui}
      />
    </>
  );
}
