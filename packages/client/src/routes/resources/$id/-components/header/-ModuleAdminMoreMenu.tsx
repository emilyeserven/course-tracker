import type { ModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import type { ResourceModulesController } from "@/hooks/useResourceModules";

import { useState } from "react";

import {
  ListPlusIcon,
  MoreHorizontalIcon,
  SparklesIcon,
  TextCursorInputIcon,
} from "lucide-react";

import { ModuleHintTemplateDialog } from "./-ModuleHintTemplateDialog";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModuleAdminMoreMenuProps {
  api: ResourceModulesController;
  ui: ModuleAdminUiState;
  /** Mirrors the toolbar's `otherActionsDisabled` — off while a full-table mode
   * or per-card edit is active. */
  disabled?: boolean;
}

/**
 * Overflow menu for the module admin toolbar's less-common actions: pick a hint
 * template, run LLM Assist, or bulk-add groups. Keeps the primary toolbar to its
 * frequent actions while these stay one click away on the far right.
 */
export function ModuleAdminMoreMenu({
  api,
  ui,
  disabled,
}: ModuleAdminMoreMenuProps) {
  const {
    groupLabel,
  } = api;
  const {
    setLlmAssistOpen, setBulkAddingGroups,
  } = ui;
  const [hintsOpen, setHintsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            title="More actions"
          >
            <MoreHorizontalIcon className="size-4" />
            More
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setHintsOpen(true)}>
            <TextCursorInputIcon />
            Hints
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setLlmAssistOpen(true)}>
            <SparklesIcon />
            LLM Assist
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setBulkAddingGroups(true)}>
            <ListPlusIcon />
            Bulk Add
            {" "}
            {groupLabel}
            s
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ModuleHintTemplateDialog
        api={api}
        open={hintsOpen}
        onOpenChange={setHintsOpen}
      />
    </>
  );
}
