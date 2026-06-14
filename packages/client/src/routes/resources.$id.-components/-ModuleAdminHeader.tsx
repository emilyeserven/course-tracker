import type { ModuleAdminSectionProps } from "./-moduleAdminSectionProps";

import { PlusIcon, SparklesIcon } from "lucide-react";

import { ModuleAssistDialog } from "./-ModuleAssistDialog";

import { Button } from "@/components/ui/button";
import { UNGROUPED_KEY } from "@/hooks/useModuleAdminUiState";

interface ModuleAdminHeaderProps extends ModuleAdminSectionProps {
  modulesAreExhaustive?: boolean;
}

/**
 * Top bar for the module admin: the progress summary, the LLM-assist / add /
 * new-group actions, and the (portalled) suggest dialog those actions drive.
 */
export function ModuleAdminHeader({
  resourceId,
  modulesAreExhaustive,
  api,
  ui,
}: ModuleAdminHeaderProps) {
  const {
    completedCount, totalCount,
  } = api;
  const {
    isAnyEditing,
    setLlmAssistOpen,
    setCreatingModuleIn,
    setCreatingGroup,
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
        <div className="flex flex-row gap-2">
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
            variant="outline"
            size="sm"
            onClick={() => setCreatingModuleIn(UNGROUPED_KEY)}
            disabled={isAnyEditing}
          >
            <PlusIcon className="size-4" />
            Add Module
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreatingGroup(true)}
            disabled={isAnyEditing}
          >
            <PlusIcon className="size-4" />
            New Group
          </Button>
        </div>
      </div>

      <ModuleAssistDialog
        resourceId={resourceId}
        api={api}
        ui={ui}
      />
    </>
  );
}
