import { useState } from "react";

/** Sentinel group key used for the top-level (ungrouped) "Add Module" slot. */
export const UNGROUPED_KEY = "__ungrouped__";

/**
 * Local UI state for the resource module admin: which group/module is being
 * edited, where a new module/group is being created, and which scope is logging
 * an interaction. Lifting it here keeps `ResourceModulesAdmin` a thin
 * composition and lets the section components read/mutate the same state.
 *
 * Only one mutation slot is meant to be active at a time; `isAnyEditing`
 * collapses every slot into the single flag the rows use to disable actions.
 */
export function useModuleAdminUiState() {
  // Group state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Module state — keyed by either groupId (string) or UNGROUPED_KEY for top level
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [creatingModuleIn, setCreatingModuleIn] = useState<string | null>(null);

  // Which module has its read-only details panel expanded (only one at a time).
  // Independent of editing — expanding details must not disable other rows.
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  // Quick-log interaction targets. Either a moduleGroupId or a moduleId is set.
  const [loggingForGroupId, setLoggingForGroupId] = useState<string | null>(
    null,
  );
  const [loggingForModuleId, setLoggingForModuleId] = useState<string | null>(
    null,
  );

  // LLM Assist dialog
  const [llmAssistOpen, setLlmAssistOpen] = useState(false);

  // Reorder mode: when on, group/module move controls (drag handles on desktop,
  // up/down arrows on small screens) are revealed. Orthogonal to editing, so it
  // deliberately does NOT feed into `isAnyEditing`.
  const [reorderMode, setReorderMode] = useState(false);

  const isAnyEditing
    = editingGroupId !== null
      || creatingGroup
      || editingModuleId !== null
      || creatingModuleIn !== null
      || loggingForGroupId !== null
      || loggingForModuleId !== null;

  return {
    editingGroupId,
    setEditingGroupId,
    creatingGroup,
    setCreatingGroup,
    editingModuleId,
    setEditingModuleId,
    creatingModuleIn,
    setCreatingModuleIn,
    expandedModuleId,
    setExpandedModuleId,
    loggingForGroupId,
    setLoggingForGroupId,
    loggingForModuleId,
    setLoggingForModuleId,
    llmAssistOpen,
    setLlmAssistOpen,
    reorderMode,
    setReorderMode,
    isAnyEditing,
  };
}

export type ModuleAdminUiState = ReturnType<typeof useModuleAdminUiState>;
