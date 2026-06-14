import type { ModuleAdminSectionProps } from "../-moduleAdminSectionProps";

import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  handleListDragEnd,
  reorderCollisionDetection,
  reorderModifiers,
  useReorderSensors,
} from "../-reorderDnd";
import { ModuleGroupSection } from "./-ModuleGroupSection";

/**
 * Renders the resource's module groups, wrapping them in the drag-and-drop
 * reorder context only while `ui.reorderMode` is on. Extracted from
 * `ResourceModulesAdmin` so the dnd-kit wiring lives in one place and the shell
 * stays a thin composition.
 */
export function ModuleGroupList({
  resourceId,
  api,
  ui,
}: ModuleAdminSectionProps) {
  const sensors = useReorderSensors();
  const {
    groups, reorderGroupsList,
  } = api;
  const {
    reorderMode,
  } = ui;

  const sections = groups.map((g, gIndex) => (
    <ModuleGroupSection
      key={g.id}
      group={g}
      groupIndex={gIndex}
      resourceId={resourceId}
      api={api}
      ui={ui}
    />
  ));

  if (!reorderMode) return <>{sections}</>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={reorderCollisionDetection}
      modifiers={reorderModifiers}
      onDragEnd={e => handleListDragEnd(e, groups, reorderGroupsList)}
    >
      <SortableContext
        items={groups.map(g => g.id)}
        strategy={verticalListSortingStrategy}
      >
        {sections}
      </SortableContext>
    </DndContext>
  );
}
