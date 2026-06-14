import type { BulkSaveRow } from "@/components/resources/ModuleBulkEditTable";
import type { ModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import type { ResourceModulesController } from "@/hooks/useResourceModules";
import type { Module } from "@emstack/types";

import { useMemo, useState } from "react";

import { useModuleBulkEditDrafts } from "@/hooks/useModuleBulkEditDrafts";

/**
 * Controller for the module bulk-edit table. Flattens the resource's modules
 * into display order, owns the staged-edit draft state, and centralises the
 * mode toggle + save + discard-on-exit confirmation so `ResourceModulesAdmin`
 * stays a thin composition. The editor lives here (not in the table) so the
 * header's exit toggle can guard unsaved edits before the table unmounts.
 */
export function useModuleBulkEdit(
  api: ResourceModulesController,
  ui: ModuleAdminUiState,
) {
  const {
    groups,
    modulesByGroup,
    ungroupedModules,
    bulkUpsertModulesMutation,
  } = api;
  const {
    bulkEditMode,
    setBulkEditMode,
    setReorderMode,
  } = ui;

  const modules = useMemo<Module[]>(() => {
    const out: Module[] = [];
    for (const g of groups) out.push(...(modulesByGroup.get(g.id) ?? []));
    out.push(...ungroupedModules);
    return out;
  }, [groups, modulesByGroup, ungroupedModules]);

  const editor = useModuleBulkEditDrafts(modules);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  function toggle() {
    if (bulkEditMode) {
      if (editor.dirtyCount > 0) {
        setConfirmExitOpen(true);
        return;
      }
      setBulkEditMode(false);
    }
    else {
      setReorderMode(false);
      setBulkEditMode(true);
    }
  }

  function saveAll(rows: BulkSaveRow[]) {
    bulkUpsertModulesMutation.mutate(rows);
  }

  function confirmExit() {
    editor.reset();
    setBulkEditMode(false);
    setConfirmExitOpen(false);
  }

  function cancelExit() {
    setConfirmExitOpen(false);
  }

  return {
    modules,
    editor,
    isSaving: bulkUpsertModulesMutation.isPending,
    confirmExitOpen,
    toggle,
    saveAll,
    confirmExit,
    cancelExit,
  };
}
