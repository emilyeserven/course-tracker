import type { ModuleAdminSectionProps } from "../-moduleAdminSectionProps";

import {
  ArrowUpDownIcon,
  CircleCheckBig,
  InfoIcon,
  PlusIcon,
  Table2Icon,
} from "lucide-react";

import { ModuleAdminMoreMenu } from "./-ModuleAdminMoreMenu";
import { ModuleAssistDialog } from "./-ModuleAssistDialog";

import { Button } from "@/components/ui/button";
import { UNGROUPED_KEY } from "@/hooks/useModuleAdminUiState";
import { cn } from "@/lib/utils";

interface ModuleAdminHeaderProps extends ModuleAdminSectionProps {
  /** When true, render the editable "module list is exhaustive" toggle. */
  canEditExhaustive?: boolean;
  /**
   * Toggle the bulk-edit table on/off. Owned by the parent so it can guard exit
   * with an unsaved-changes confirmation (the staged edits live up there).
   */
  onToggleBulkEdit: () => void;
}

/**
 * Top bar for the module admin: the progress summary, the bulk-edit / reorder /
 * add / new-group actions, an overflow "More" menu (hints, LLM assist, bulk-add
 * groups), and the (portalled) suggest dialog the LLM-assist action drives.
 */
export function ModuleAdminHeader({
  resourceId,
  canEditExhaustive,
  onToggleBulkEdit,
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
    setCreatingModuleIn,
    setCreatingGroup,
    reorderMode,
    setReorderMode,
    bulkEditMode,
  } = ui;

  // Bulk edit and reorder are conflicting full-table modes; the other actions
  // are meaningless while the bulk table is open. `isAnyEditing` already covers
  // the per-card edit/create slots.
  const otherActionsDisabled = isAnyEditing || bulkEditMode;

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
          <Button
            variant={bulkEditMode ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleBulkEdit}
            disabled={isAnyEditing || reorderMode}
            aria-pressed={bulkEditMode}
            title="Edit all modules in a table"
          >
            <Table2Icon className="size-4" />
            Bulk Edit
          </Button>
          <Button
            variant={reorderMode ? "secondary" : "outline"}
            size="sm"
            onClick={() => setReorderMode(!reorderMode)}
            disabled={otherActionsDisabled}
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
            disabled={otherActionsDisabled}
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
            disabled={otherActionsDisabled}
          >
            <PlusIcon className="size-4" />
            New
            {" "}
            {groupLabel}
          </Button>
          <ModuleAdminMoreMenu
            api={api}
            ui={ui}
            disabled={otherActionsDisabled}
          />
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
          ? (
            <CircleCheckBig className="mt-0.5 size-4 shrink-0" />
          )
          : (
            <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
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
            className={cn(
              "text-xs",
              !modulesAreExhaustive
              && "text-muted-foreground",
            )}
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
