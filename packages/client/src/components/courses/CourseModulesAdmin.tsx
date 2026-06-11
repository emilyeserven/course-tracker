import { Fragment, useState } from "react";

import {
  ActivityIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react";

import { GroupEditCard, GroupMetaChips } from "./GroupEditCard";
import { InteractionQuickLog } from "./InteractionQuickLog";
import { ModuleDisplayRow } from "./ModuleDisplayRow";
import {
  emptyGroupDraft,
  emptyModuleDraft,
  groupToDraft,
  moduleToDraft,
} from "./moduleDrafts";
import { ModuleEditCard } from "./ModuleEditCard";
import { ModuleSuggestDialog } from "./ModuleSuggestDialog";

import { Button } from "@/components/ui/button";
import { useCourseModules } from "@/hooks/useCourseModules";
import { isHttpUrl } from "@/utils";

interface Props {
  resourceId: string;
  modulesAreExhaustive?: boolean;
}

export function CourseModulesAdmin({
  resourceId,
  modulesAreExhaustive,
}: Props) {
  const {
    resourceQuery,
    tagGroups,
    groups,
    ungroupedModules,
    modulesByGroup,
    completedCount,
    totalCount,
    invalidateAll,
    createGroupMutation,
    upsertGroupMutation,
    deleteGroupMutation,
    createModuleMutation,
    upsertModuleMutation,
    toggleCompleteMutation,
    deleteModuleMutation,
    moveModule,
    moveGroup,
    isReordering,
  } = useCourseModules(resourceId);

  // Group state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Module state — keyed by either groupId (string) or "__ungrouped__" for top level
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [creatingModuleIn, setCreatingModuleIn] = useState<string | null>(null);

  // Quick-log interaction targets. Either a moduleGroupId or a moduleId is set.
  const [loggingForGroupId, setLoggingForGroupId] = useState<string | null>(
    null,
  );
  const [loggingForModuleId, setLoggingForModuleId] = useState<string | null>(
    null,
  );

  // LLM Assist dialog
  const [llmAssistOpen, setLlmAssistOpen] = useState(false);

  const isAnyEditing
    = editingGroupId !== null
      || creatingGroup
      || editingModuleId !== null
      || creatingModuleIn !== null
      || loggingForGroupId !== null
      || loggingForModuleId !== null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">Modules</h2>
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} complete
              {modulesAreExhaustive && totalCount > 0 && (
                <span>
                  {" "}
                  · {Math.round((completedCount / totalCount) * 100)}%
                </span>
              )}
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
            onClick={() => setCreatingModuleIn("__ungrouped__")}
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

      <ModuleSuggestDialog
        open={llmAssistOpen}
        onOpenChange={setLlmAssistOpen}
        resourceId={resourceId}
        resourceName={resourceQuery.data?.name ?? "this resource"}
        resourceDescription={resourceQuery.data?.description ?? null}
        resourceUrl={resourceQuery.data?.url ?? null}
        providerName={resourceQuery.data?.provider?.name ?? null}
        topicNames={(resourceQuery.data?.topics ?? []).map(t => t.name)}
        existingGroupNames={groups.map(g => g.name)}
        existingUngroupedModuleNames={ungroupedModules.map(m => m.name)}
        onApplied={() => invalidateAll()}
      />

      {creatingGroup && (
        <GroupEditCard
          draft={emptyGroupDraft()}
          hasEnumeratedModules={false}
          tagGroups={tagGroups}
          isNew
          isSaving={createGroupMutation.isPending}
          onSave={d =>
            createGroupMutation.mutate(d, {
              onSuccess: () => setCreatingGroup(false),
            })}
          onCancel={() => setCreatingGroup(false)}
        />
      )}

      {/* Ungrouped modules */}
      {(creatingModuleIn === "__ungrouped__"
        || ungroupedModules.length > 0) && (
        <div className="flex flex-col gap-2 rounded-md border bg-background p-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Ungrouped
          </h3>
          {creatingModuleIn === "__ungrouped__" && (
            <ModuleEditCard
              draft={emptyModuleDraft()}
              tagGroups={tagGroups}
              isNew
              isComplete={false}
              isSaving={createModuleMutation.isPending}
              onSave={d =>
                createModuleMutation.mutate(
                  {
                    draft: d,
                    groupId: null,
                  },
                  {
                    onSuccess: () => setCreatingModuleIn(null),
                  },
                )}
              onCancel={() => setCreatingModuleIn(null)}
            />
          )}
          <ul className="flex flex-col divide-y rounded-sm border">
            {ungroupedModules.map((m, index) =>
              m.id === editingModuleId
                ? (
                  <ModuleEditCard
                    key={m.id}
                    draft={moduleToDraft(m)}
                    tagGroups={tagGroups}
                    isComplete={m.isComplete}
                    isSaving={
                      upsertModuleMutation.isPending
                      || deleteModuleMutation.isPending
                    }
                    onSave={d =>
                      upsertModuleMutation.mutate(
                        {
                          draft: d,
                          groupId: null,
                          isComplete: m.isComplete,
                        },
                        {
                          onSuccess: () => setEditingModuleId(null),
                        },
                      )}
                    onCancel={() => setEditingModuleId(null)}
                    onDelete={() =>
                      deleteModuleMutation.mutate(m.id, {
                        onSuccess: () => setEditingModuleId(null),
                      })}
                  />
                )
                : (
                  <Fragment key={m.id}>
                    <ModuleDisplayRow
                      module={m}
                      isAnyEditing={isAnyEditing}
                      isReordering={isReordering}
                      canMoveUp={index > 0}
                      canMoveDown={index < ungroupedModules.length - 1}
                      onMoveUp={() => moveModule(ungroupedModules, index, "up")}
                      onMoveDown={() =>
                        moveModule(ungroupedModules, index, "down")}
                      onToggleComplete={() => toggleCompleteMutation.mutate(m)}
                      onEdit={() => setEditingModuleId(m.id)}
                      onLogInteraction={() => setLoggingForModuleId(m.id)}
                      isToggling={toggleCompleteMutation.isPending}
                    />
                    {loggingForModuleId === m.id && (
                      <li className="border-t bg-muted/30 p-3">
                        <InteractionQuickLog
                          resourceId={resourceId}
                          moduleId={m.id}
                          scopeLabel={`module: ${m.name}`}
                          onCancel={() => setLoggingForModuleId(null)}
                          onSaved={() => setLoggingForModuleId(null)}
                        />
                      </li>
                    )}
                  </Fragment>
                ))}
          </ul>
        </div>
      )}

      {/* Module Groups */}
      {groups.map((g, gIndex) => {
        const groupModules = modulesByGroup.get(g.id) ?? [];
        const isEditing = editingGroupId === g.id;
        const isCreatingHere = creatingModuleIn === g.id;

        if (isEditing) {
          return (
            <GroupEditCard
              key={g.id}
              draft={groupToDraft(g)}
              hasEnumeratedModules={groupModules.length > 0}
              tagGroups={tagGroups}
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
            key={g.id}
            className="flex flex-col gap-2 rounded-md border bg-background p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-medium">
                  {g.url
                    ? (
                      isHttpUrl(g.url)
                        ? (
                          <a
                            href={g.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-600"
                          >
                            {g.name}
                            {" "}
                            <ExternalLinkIcon className="inline size-3.5" />
                          </a>
                        )
                        : (
                          <span title={g.url}>{g.name}</span>
                        )
                    )
                    : (
                      g.name
                    )}
                </h3>
                {g.description && (
                  <span className="text-xs text-muted-foreground">
                    {g.description}
                  </span>
                )}
              </div>
              <div className="flex flex-row items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => moveGroup(gIndex, "up")}
                    disabled={isAnyEditing || isReordering || gIndex === 0}
                    aria-label="Move group up"
                    title="Move group up"
                  >
                    <ChevronUpIcon className="size-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => moveGroup(gIndex, "down")}
                    disabled={
                      isAnyEditing
                      || isReordering
                      || gIndex === groups.length - 1
                    }
                    aria-label="Move group down"
                    title="Move group down"
                  >
                    <ChevronDownIcon className="size-3.5" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCreatingModuleIn(g.id)}
                  disabled={isAnyEditing}
                >
                  <PlusIcon className="size-3.5" />
                  Add Module
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
              </div>
            </div>
            <GroupMetaChips
              easeOfStarting={g.easeOfStarting ?? null}
              timeNeeded={g.timeNeeded ?? null}
              interactivity={g.interactivity ?? null}
              tags={g.tags ?? []}
            />
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
                isComplete={false}
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
            {groupModules.length > 0 && (
              <ul className="flex flex-col divide-y rounded-sm border">
                {groupModules.map((m, mIndex) =>
                  m.id === editingModuleId
                    ? (
                      <ModuleEditCard
                        key={m.id}
                        draft={moduleToDraft(m)}
                        tagGroups={tagGroups}
                        isComplete={m.isComplete}
                        isSaving={
                          upsertModuleMutation.isPending
                          || deleteModuleMutation.isPending
                        }
                        onSave={d =>
                          upsertModuleMutation.mutate(
                            {
                              draft: d,
                              groupId: g.id,
                              isComplete: m.isComplete,
                            },
                            {
                              onSuccess: () => setEditingModuleId(null),
                            },
                          )}
                        onCancel={() => setEditingModuleId(null)}
                        onDelete={() =>
                          deleteModuleMutation.mutate(m.id, {
                            onSuccess: () => setEditingModuleId(null),
                          })}
                      />
                    )
                    : (
                      <Fragment key={m.id}>
                        <ModuleDisplayRow
                          module={m}
                          isAnyEditing={isAnyEditing}
                          isReordering={isReordering}
                          canMoveUp={mIndex > 0}
                          canMoveDown={mIndex < groupModules.length - 1}
                          onMoveUp={() => moveModule(groupModules, mIndex, "up")}
                          onMoveDown={() =>
                            moveModule(groupModules, mIndex, "down")}
                          onToggleComplete={() =>
                            toggleCompleteMutation.mutate(m)}
                          onEdit={() => setEditingModuleId(m.id)}
                          onLogInteraction={() => setLoggingForModuleId(m.id)}
                          isToggling={toggleCompleteMutation.isPending}
                        />
                        {loggingForModuleId === m.id && (
                          <li className="border-t bg-muted/30 p-3">
                            <InteractionQuickLog
                              resourceId={resourceId}
                              moduleId={m.id}
                              scopeLabel={`module: ${m.name}`}
                              onCancel={() => setLoggingForModuleId(null)}
                              onSaved={() => setLoggingForModuleId(null)}
                            />
                          </li>
                        )}
                      </Fragment>
                    ))}
              </ul>
            )}
            {groupModules.length === 0
              && !isCreatingHere
              && (g.totalCount != null || g.completedCount != null) && (
              <p className="text-xs text-muted-foreground">
                {g.completedCount ?? 0}
                {" / "}
                {g.totalCount ?? 0}
                {" complete"}
              </p>
            )}
            {groupModules.length === 0
              && !isCreatingHere
              && g.totalCount == null
              && g.completedCount == null && (
              <p className="text-xs text-muted-foreground">
                No modules in this group yet — add modules, or edit the group
                to track totals directly.
              </p>
            )}
          </div>
        );
      })}

      {groups.length === 0
        && ungroupedModules.length === 0
        && !creatingGroup
        && creatingModuleIn === null && (
        <p className="text-sm text-muted-foreground">
          No modules yet. Add a module directly, or create a module group to
          organize them.
        </p>
      )}
    </div>
  );
}
