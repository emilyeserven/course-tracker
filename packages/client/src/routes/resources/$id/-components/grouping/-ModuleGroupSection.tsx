import type { ModuleAdminSectionProps } from "../-moduleAdminSectionProps";
import type { ModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import type { ResourceModulesController } from "@/hooks/useResourceModules";
import type { Module, ModuleGroup, ModuleStatus } from "@emstack/types";

import { useState } from "react";

import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatPageRange } from "@emstack/types";
import {
  ActivityIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  GripVerticalIcon,
  ListPlusIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";

import {
  handleListDragEnd,
  reorderCollisionDetection,
  reorderModifiers,
  useReorderSensors,
} from "../-reorderDnd";
import { ModuleListItem } from "../item";

import {
  BulkNameAddCard,
  GroupEditCard,
  GroupMetaChips,
  InteractionQuickLog,
  ModuleEditCard,
} from "@/components/resources/moduleAdminComponents";
import {
  emptyModuleDraft,
  groupToDraft,
} from "@/components/resources/moduleDrafts";
import {
  getGroupStatus,
  getModuleStatusOption,
} from "@/components/resources/moduleStatusMeta";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isHttpUrl } from "@/utils";

interface ModuleGroupSectionProps extends ModuleAdminSectionProps {
  group: ModuleGroup;
  groupIndex: number;
}

/** De-emphasized page range shown after a group/module title (book resources). */
function PageRange({
  start,
  end,
}: {
  start?: number | null;
  end?: number | null;
}) {
  const label = formatPageRange(start, end);
  if (!label) return null;
  return (
    <span className="ml-2 text-xs font-normal text-muted-foreground">
      {label}
    </span>
  );
}

/**
 * The group title — plain text (the external link, when present, is its own
 * button in the header controls). A non-http url is surfaced as a tooltip.
 */
function GroupTitle({
  group: g,
}: { group: ModuleGroup }) {
  const pages = (
    <PageRange
      start={g.pageStart}
      end={g.pageEnd}
    />
  );
  if (g.url && !isHttpUrl(g.url)) {
    return (
      <>
        <span title={g.url}>{g.name}</span>
        {pages}
      </>
    );
  }
  return (
    <>
      {g.name}
      {pages}
    </>
  );
}

/** Read-only status circle shown beside a group name; auto-derived, not clickable. */
function GroupStatusBadge({
  status,
}: { status: ModuleStatus }) {
  const option = getModuleStatusOption(status);
  return (
    <span
      title={`Status: ${option.label}`}
      aria-label={`Status: ${option.label}`}
      className={cn(
        `
          inline-flex size-5 shrink-0 items-center justify-center rounded-full
          [&_svg]:size-3.5
        `,
        option.circleClass,
      )}
    >
      {option.icon}
    </span>
  );
}

/** Group meta chips, coalescing the group's optional level/tag fields. */
function GroupMeta({
  group: g,
}: { group: ModuleGroup }) {
  return (
    <GroupMetaChips
      easeOfStarting={g.easeOfStarting ?? null}
      timeNeeded={g.timeNeeded ?? null}
      interactivity={g.interactivity ?? null}
      tags={g.tags ?? []}
    />
  );
}

/** Reorder / add-module / log / edit controls in the group header. */
function GroupHeaderControls({
  group: g,
  groupIndex: gIndex,
  api,
  ui,
  dragHandleProps,
}: {
  group: ModuleGroup;
  groupIndex: number;
  api: ResourceModulesController;
  ui: ModuleAdminUiState;
  dragHandleProps?: Record<string, unknown>;
}) {
  const {
    groups, moveGroup, isReordering,
  } = api;
  const {
    isAnyEditing,
    reorderMode,
    setCreatingModuleIn,
    setBulkAddingInGroupId,
    setLoggingForGroupId,
    setEditingGroupId,
  } = ui;

  // Only a list with more than one group can be reordered.
  const showReorder = reorderMode && !isAnyEditing && groups.length > 1;

  return (
    <div className="flex flex-row items-center gap-2">
      {showReorder && (
        <>
          <span
            className="
              flex items-center gap-0.5
              md:hidden
            "
          >
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => moveGroup(gIndex, "up")}
              disabled={isReordering || gIndex === 0}
              aria-label="Move group up"
              title="Move group up"
            >
              <ChevronUpIcon className="size-3.5" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => moveGroup(gIndex, "down")}
              disabled={isReordering || gIndex === groups.length - 1}
              aria-label="Move group down"
              title="Move group down"
            >
              <ChevronDownIcon className="size-3.5" />
            </Button>
          </span>
          <button
            type="button"
            {...dragHandleProps}
            onClick={e => e.stopPropagation()}
            aria-label={`Drag to reorder ${g.name}`}
            title="Drag to reorder"
            className="
              hidden size-7 cursor-grab touch-none items-center justify-center
              rounded-md text-muted-foreground
              hover:bg-accent
              active:cursor-grabbing
              md:inline-flex
            "
          >
            <GripVerticalIcon className="size-3.5" />
          </button>
        </>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setCreatingModuleIn(g.id)}
        disabled={isAnyEditing}
      >
        <PlusIcon className="size-3.5" />
        Add
        {" "}
        {api.moduleLabel}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setBulkAddingInGroupId(g.id)}
        disabled={isAnyEditing}
        title={`Add several ${api.moduleLabel.toLowerCase()}s at once`}
      >
        <ListPlusIcon className="size-3.5" />
        Bulk Add
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={() => setLoggingForGroupId(g.id)}
        disabled={isAnyEditing}
        aria-label={`Log interaction for ${g.name}`}
        title="Log interaction"
      >
        <ActivityIcon className="size-3.5" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setEditingGroupId(g.id)}
        disabled={isAnyEditing}
      >
        <PencilIcon className="size-3.5" />
      </Button>
      {g.url && isHttpUrl(g.url) && (
        <Button
          asChild
          size="icon-sm"
          variant="ghost"
          aria-label={`Open link for ${g.name}`}
          title="Open link"
        >
          <a
            href={g.url}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLinkIcon className="size-3.5" />
          </a>
        </Button>
      )}
    </div>
  );
}

/**
 * The enumerated module rows for a group; renders nothing when empty. In reorder
 * mode the list becomes its own sortable scope so a module can only be dragged
 * within its own group.
 */
function GroupModuleList({
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

/**
 * Fallback shown when a group has no enumerated modules and none is being
 * created: either its direct progress counts or a hint to add modules.
 */
function GroupProgressHint({
  group: g,
  groupModules,
  isCreatingHere,
}: {
  group: ModuleGroup;
  groupModules: Module[];
  isCreatingHere: boolean;
}) {
  if (groupModules.length > 0 || isCreatingHere) return null;

  if (g.totalCount != null || g.completedCount != null) {
    return (
      <p className="text-xs text-muted-foreground">
        {g.completedCount ?? 0}
        {" / "}
        {g.totalCount ?? 0}
        {" complete"}
      </p>
    );
  }

  return (
    <p className="text-xs text-muted-foreground">
      No modules in this group yet — add modules, or edit the group to track
      totals directly.
    </p>
  );
}

/**
 * One module group: header (collapse toggle, title, auto status icon, controls),
 * meta chips, optional quick-log + create-module cards, the enumerated module
 * list, and the fallback progress/empty hints. Clicking the header collapses the
 * body. Swaps to an inline `GroupEditCard` while this group is being edited.
 */
export function ModuleGroupSection({
  group: g,
  groupIndex: gIndex,
  resourceId,
  api,
  ui,
}: ModuleGroupSectionProps) {
  const {
    tagGroups,
    modulesByGroup,
    upsertGroupMutation,
    deleteGroupMutation,
    createModuleMutation,
    bulkCreateModulesMutation,
  } = api;
  const {
    editingGroupId,
    setEditingGroupId,
    creatingModuleIn,
    setCreatingModuleIn,
    bulkAddingInGroupId,
    setBulkAddingInGroupId,
    loggingForGroupId,
    setLoggingForGroupId,
  } = ui;

  const {
    attributes, listeners, setNodeRef, transform, transition,
  }
    = useSortable({
      id: g.id,
    });
  const [collapsed, setCollapsed] = useState(false);

  const groupModules = modulesByGroup.get(g.id) ?? [];
  const isCreatingHere = creatingModuleIn === g.id;
  const isBulkAddingHere = bulkAddingInGroupId === g.id;
  const groupStatus = getGroupStatus(g, groupModules);

  if (editingGroupId === g.id) {
    return (
      <GroupEditCard
        draft={groupToDraft(g)}
        hasEnumeratedModules={groupModules.length > 0}
        tagGroups={tagGroups}
        showPages={api.isBook}
        groupLabel={api.groupLabel}
        groupNamePlaceholder={api.groupHint}
        isSaving={
          upsertGroupMutation.isPending || deleteGroupMutation.isPending
        }
        onSave={d =>
          upsertGroupMutation.mutate(d, {
            onSuccess: () => setEditingGroupId(null),
          })}
        onCancel={() => setEditingGroupId(null)}
        onDelete={() =>
          deleteGroupMutation.mutate(g.id, {
            onSuccess: () => setEditingGroupId(null),
          })}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="flex flex-col gap-2 rounded-md border bg-background p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="flex flex-1 cursor-pointer flex-col gap-0.5"
          onClick={() => setCollapsed(c => !c)}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(c => !c);
              }}
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand group" : "Collapse group"}
              className="
                inline-flex size-5 shrink-0 items-center justify-center
                text-muted-foreground
              "
            >
              {collapsed
                ? (
                  <ChevronRightIcon className="size-4" />
                )
                : (
                  <ChevronDownIcon className="size-4" />
                )}
            </button>
            <GroupStatusBadge status={groupStatus} />
            <h3 className="font-medium">
              <GroupTitle group={g} />
            </h3>
          </div>
          {g.description && (
            <span className="text-xs text-muted-foreground">
              {g.description}
            </span>
          )}
        </div>
        <GroupHeaderControls
          group={g}
          groupIndex={gIndex}
          api={api}
          ui={ui}
          dragHandleProps={{
            ...attributes,
            ...listeners,
          }}
        />
      </div>
      {!collapsed && (
        <>
          <GroupMeta group={g} />
          {loggingForGroupId === g.id && (
            <InteractionQuickLog
              resourceId={resourceId}
              moduleGroupId={g.id}
              scopeLabel={`group: ${g.name}`}
              onCancel={() => setLoggingForGroupId(null)}
              onSaved={() => setLoggingForGroupId(null)}
            />
          )}
          {isCreatingHere && (
            <ModuleEditCard
              draft={emptyModuleDraft()}
              tagGroups={tagGroups}
              isNew
              showPages={api.isBook}
              moduleLabel={api.moduleLabel}
              moduleNamePlaceholder={api.moduleHint}
              isSaving={createModuleMutation.isPending}
              onSave={d =>
                createModuleMutation.mutate(
                  {
                    draft: d,
                    groupId: g.id,
                  },
                  {
                    onSuccess: () => setCreatingModuleIn(null),
                  },
                )}
              onCancel={() => setCreatingModuleIn(null)}
            />
          )}
          {isBulkAddingHere && (
            <BulkNameAddCard
              itemLabel={api.moduleLabel}
              namePlaceholder={api.moduleHint}
              isSaving={bulkCreateModulesMutation.isPending}
              onSave={names =>
                bulkCreateModulesMutation.mutate(
                  {
                    names,
                    groupId: g.id,
                  },
                  {
                    onSuccess: () => setBulkAddingInGroupId(null),
                  },
                )}
              onCancel={() => setBulkAddingInGroupId(null)}
            />
          )}
          <GroupModuleList
            group={g}
            resourceId={resourceId}
            groupModules={groupModules}
            api={api}
            ui={ui}
          />
          <GroupProgressHint
            group={g}
            groupModules={groupModules}
            isCreatingHere={isCreatingHere || isBulkAddingHere}
          />
        </>
      )}
    </div>
  );
}
