import { PlusIcon } from "lucide-react";

import { GroupDisplayRow } from "./-GroupDisplayRow";
import { GroupEditRow } from "./-GroupEditRow";
import { makeEmptyGroupDraft } from "./-tagDrafts";
import { useTagGroupsAdmin } from "./-useTagGroupsAdmin";

import { Button } from "@/components/ui/button";

export function TagGroupsAdmin() {
  const {
    groups,
    isPending,
    isAnyEditing,
    isGroupBusy,
    editingGroupId,
    setEditingGroupId,
    creatingGroup,
    setCreatingGroup,
    tagEditState,
    setTagEditState,
    creatingTagInGroup,
    setCreatingTagInGroup,
    upsertGroupMutation,
    createGroupMutation,
    deleteGroupMutation,
    upsertTagMutation,
    createTagMutation,
    deleteTagMutation,
  } = useTagGroupsAdmin();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Tag Groups</h2>
        <Button
          variant="outline"
          onClick={() => setCreatingGroup(true)}
          disabled={isAnyEditing}
        >
          <PlusIcon />
          New Tag Group
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Tag groups organize tags. Tags belong to one group and can be applied to
        tasks and resources.
      </p>
      {isPending
        ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )
        : groups.length === 0 && !creatingGroup
          ? (
            <p className="text-sm text-muted-foreground">
              No tag groups yet. Create one to start organizing tags.
            </p>
          )
          : (
            <ul className="flex flex-col divide-y rounded-md border">
              {creatingGroup && (
                <GroupEditRow
                  draft={makeEmptyGroupDraft()}
                  isNew
                  isSaving={createGroupMutation.isPending}
                  onSave={d => createGroupMutation.mutate(d)}
                  onCancel={() => setCreatingGroup(false)}
                />
              )}
              {groups.map((g) => {
                if (g.id === editingGroupId) {
                  return (
                    <GroupEditRow
                      key={g.id}
                      draft={{
                        id: g.id,
                        name: g.name,
                        description: g.description ?? "",
                        color: g.color ?? "",
                      }}
                      isSaving={isGroupBusy}
                      onSave={d => upsertGroupMutation.mutate(d)}
                      onCancel={() => setEditingGroupId(null)}
                      onDelete={() => deleteGroupMutation.mutate(g.id)}
                      deleteDisabled={(g.tags?.length ?? 0) > 0}
                      deleteDisabledReason="Remove all tags first"
                    />
                  );
                }
                return (
                  <GroupDisplayRow
                    key={g.id}
                    group={g}
                    isAnyEditing={isAnyEditing}
                    onEdit={() => setEditingGroupId(g.id)}
                    creatingTag={creatingTagInGroup === g.id}
                    onStartCreateTag={() => setCreatingTagInGroup(g.id)}
                    onCancelCreateTag={() => setCreatingTagInGroup(null)}
                    onCreateTag={d => createTagMutation.mutate(d)}
                    isCreatingTag={createTagMutation.isPending}
                    editingTagId={
                      tagEditState && tagEditState.groupId === g.id
                        ? tagEditState.tagId
                        : null
                    }
                    onStartEditTag={tagId =>
                      setTagEditState({
                        groupId: g.id,
                        tagId,
                      })}
                    onCancelEditTag={() => setTagEditState(null)}
                    onUpsertTag={d => upsertTagMutation.mutate(d)}
                    onDeleteTag={tagId => deleteTagMutation.mutate(tagId)}
                    isTagBusy={
                      upsertTagMutation.isPending || deleteTagMutation.isPending
                    }
                  />
                );
              })}
            </ul>
          )}
    </section>
  );
}
