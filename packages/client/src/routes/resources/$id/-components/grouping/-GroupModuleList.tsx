import type { ModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import type { ResourceModulesController } from "@/hooks/useResourceModules";
import type { Module, ModuleGroup } from "@emstack/types";

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
import { ModuleListItem } from "../item";

/**
 * The enumerated module rows for a group; renders nothing when empty. In reorder
 * mode the list becomes its own sortable scope so a module can only be dragged
 * within its own group.
 */
export function GroupModuleList({
  group: g,
  resourceId,
  groupModules,
  api,
  ui,
}: {
  group: ModuleGroup;
  resourceId: string;
  groupModules: Module[];
  api: ResourceModulesController;
  ui: ModuleAdminUiState;
}) {
  const sensors = useReorderSensors();
  if (groupModules.length === 0) return null;

  const list = (
    <ul className="flex flex-col divide-y rounded-sm border">
      {groupModules.map((m, mIndex) => (
        <ModuleListItem
          key={m.id}
          module={m}
          resourceId={resourceId}
          groupId={g.id}
          list={groupModules}
          index={mIndex}
          api={api}
          ui={ui}
        />
      ))}
    </ul>
  );

  if (!ui.reorderMode) return list;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={reorderCollisionDetection}
      modifiers={reorderModifiers}
      onDragEnd={e =>
        handleListDragEnd(e, groupModules, api.reorderModulesList)}
    >
      <SortableContext
        items={groupModules.map(m => m.id)}
        strategy={verticalListSortingStrategy}
      >
        {list}
      </SortableContext>
    </DndContext>
  );
}
