import type { EditRowBaseProps } from "@/types/editRowProps";
import type { Tag, TagGroup } from "@emstack/types";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { EditFormActions } from "@/components/layout/EditFormActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createTag,
  createTagGroup,
  deleteSingleTag,
  deleteSingleTagGroup,
  fetchTagGroups,
  upsertTag,
  upsertTagGroup,
} from "@/utils";

const NEW_GROUP_ID = "__new_group__";
const NEW_TAG_ID = "__new_tag__";

interface TagGroupDraft {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface TagDraft {
  id: string;
  groupId: string;
  name: string;
  color: string;
}

function makeEmptyGroupDraft(): TagGroupDraft {
  return {
    id: NEW_GROUP_ID,
    name: "",
    description: "",
    color: "",
  };
}

function makeEmptyTagDraft(groupId: string): TagDraft {
  return {
    id: NEW_TAG_ID,
    groupId,
    name: "",
    color: "",
  };
}

export function TagGroupsAdmin() {
  const queryClient = useQueryClient();

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [tagEditState, setTagEditState] = useState<{
    groupId: string;
    tagId: string;
  } | null>(null);
  const [creatingTagInGroup, setCreatingTagInGroup] = useState<string | null>(
    null,
  );

  const groupsQuery = useQuery({
    queryKey: ["tagGroups"],
    queryFn: () => fetchTagGroups(),
  });

  function invalidateGroups() {
    queryClient.invalidateQueries({
      queryKey: ["tagGroups"],
    });
  }

  const upsertGroupMutation = useMutation({
    mutationFn: (draft: TagGroupDraft) =>
      upsertTagGroup(draft.id, {
        name: draft.name,
        description: draft.description || null,
        color: draft.color || null,
      }),
    onSuccess: () => {
      invalidateGroups();
      setEditingGroupId(null);
      toast.success("Tag group saved");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createGroupMutation = useMutation({
    mutationFn: (draft: TagGroupDraft) =>
      createTagGroup({
        name: draft.name,
        description: draft.description || null,
        color: draft.color || null,
      }),
    onSuccess: () => {
      invalidateGroups();
      setCreatingGroup(false);
      toast.success("Tag group created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => deleteSingleTagGroup(id),
    onSuccess: () => {
      invalidateGroups();
      setEditingGroupId(null);
      toast.success("Tag group deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const upsertTagMutation = useMutation({
    mutationFn: (draft: TagDraft) =>
      upsertTag(draft.id, {
        name: draft.name,
        groupId: draft.groupId,
        color: draft.color || null,
      }),
    onSuccess: () => {
      invalidateGroups();
      setTagEditState(null);
      toast.success("Tag saved");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createTagMutation = useMutation({
    mutationFn: (draft: TagDraft) =>
      createTag({
        name: draft.name,
        groupId: draft.groupId,
        color: draft.color || null,
      }),
    onSuccess: () => {
      invalidateGroups();
      setCreatingTagInGroup(null);
      toast.success("Tag created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => deleteSingleTag(id),
    onSuccess: () => {
      invalidateGroups();
      setTagEditState(null);
      toast.success("Tag deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const groups = groupsQuery.data ?? [];
  const isAnyEditing
    = editingGroupId !== null
      || creatingGroup
      || tagEditState !== null
      || creatingTagInGroup !== null;
  const isGroupBusy
    = upsertGroupMutation.isPending
      || createGroupMutation.isPending
      || deleteGroupMutation.isPending;

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
        tasks, resources, and topics.
      </p>
      {groupsQuery.isPending
        ? <p className="text-sm text-muted-foreground">Loading...</p>
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

interface GroupEditRowProps extends EditRowBaseProps {
  draft: TagGroupDraft;
  onSave: (draft: TagGroupDraft) => void;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
}

function GroupEditRow({
  draft: initial,
  isNew = false,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
  deleteDisabled = false,
  deleteDisabledReason,
}: GroupEditRowProps) {
  const [draft, setDraft] = useState<TagGroupDraft>(initial);

  function update(patch: Partial<TagGroupDraft>) {
    setDraft(prev => ({
      ...prev,
      ...patch,
    }));
  }

  return (
    <li className="bg-muted/30 p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(draft);
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-group-name"
          >
            Name
          </label>
          <Input
            id="tag-group-name"
            type="text"
            value={draft.name}
            onChange={e => update({
              name: e.target.value,
            })}
            required
            placeholder="e.g. skills, format"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-group-description"
          >
            Description
          </label>
          <Textarea
            id="tag-group-description"
            value={draft.description}
            onChange={e => update({
              description: e.target.value,
            })}
            placeholder="What this group is for"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-group-color"
          >
            Color
            {" "}
            <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="tag-group-color"
            type="text"
            value={draft.color}
            onChange={e => update({
              color: e.target.value,
            })}
            placeholder="e.g. blue, #34d"
          />
        </div>
        <EditFormActions
          isSaving={isSaving}
          onCancel={onCancel}
          onDelete={onDelete}
          isNew={isNew}
          deleteDisabled={deleteDisabled}
          deleteDisabledReason={deleteDisabledReason}
        />
      </form>
    </li>
  );
}

interface GroupDisplayRowProps {
  group: TagGroup;
  isAnyEditing: boolean;
  onEdit: () => void;
  creatingTag: boolean;
  onStartCreateTag: () => void;
  onCancelCreateTag: () => void;
  onCreateTag: (draft: TagDraft) => void;
  isCreatingTag: boolean;
  editingTagId: string | null;
  onStartEditTag: (tagId: string) => void;
  onCancelEditTag: () => void;
  onUpsertTag: (draft: TagDraft) => void;
  onDeleteTag: (tagId: string) => void;
  isTagBusy: boolean;
}

function GroupDisplayRow({
  group,
  isAnyEditing,
  onEdit,
  creatingTag,
  onStartCreateTag,
  onCancelCreateTag,
  onCreateTag,
  isCreatingTag,
  editingTagId,
  onStartEditTag,
  onCancelEditTag,
  onUpsertTag,
  onDeleteTag,
  isTagBusy,
}: GroupDisplayRowProps) {
  const tags = group.tags ?? [];
  return (
    <li className="flex flex-col gap-2 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{group.name}</span>
          {group.description && (
            <span className="text-xs text-muted-foreground">
              {group.description}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            disabled={isAnyEditing}
          >
            <PencilIcon className="size-4" />
            Edit Group
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onStartCreateTag}
            disabled={isAnyEditing}
          >
            <PlusIcon className="size-4" />
            Add Tag
          </Button>
        </div>
      </div>
      <ul className="flex flex-col divide-y rounded-sm border bg-background">
        {creatingTag && (
          <TagEditRow
            draft={makeEmptyTagDraft(group.id)}
            isNew
            isSaving={isCreatingTag}
            onSave={onCreateTag}
            onCancel={onCancelCreateTag}
          />
        )}
        {tags.length === 0 && !creatingTag && (
          <li className="px-2 py-1.5 text-xs text-muted-foreground">
            No tags in this group.
          </li>
        )}
        {tags.map((tag) => {
          if (tag.id === editingTagId) {
            return (
              <TagEditRow
                key={tag.id}
                draft={{
                  id: tag.id,
                  groupId: tag.groupId,
                  name: tag.name,
                  color: tag.color ?? "",
                }}
                isSaving={isTagBusy}
                onSave={onUpsertTag}
                onCancel={onCancelEditTag}
                onDelete={() => onDeleteTag(tag.id)}
              />
            );
          }
          return (
            <TagDisplayRow
              key={tag.id}
              tag={tag}
              isAnyEditing={isAnyEditing}
              onEdit={() => onStartEditTag(tag.id)}
            />
          );
        })}
      </ul>
    </li>
  );
}

function TagDisplayRow({
  tag,
  isAnyEditing,
  onEdit,
}: {
  tag: Tag;
  isAnyEditing: boolean;
  onEdit: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-2 px-2 py-1.5">
      <span className="text-sm">{tag.name}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={onEdit}
        disabled={isAnyEditing}
      >
        <PencilIcon className="size-3.5" />
      </Button>
    </li>
  );
}

interface TagEditRowProps extends EditRowBaseProps {
  draft: TagDraft;
  onSave: (draft: TagDraft) => void;
}

function TagEditRow({
  draft: initial,
  isNew = false,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: TagEditRowProps) {
  const [draft, setDraft] = useState<TagDraft>(initial);

  function update(patch: Partial<TagDraft>) {
    setDraft(prev => ({
      ...prev,
      ...patch,
    }));
  }

  return (
    <li className="bg-muted/40 p-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(draft);
        }}
        className="flex flex-col gap-2"
      >
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-name"
          >
            Tag Name
          </label>
          <Input
            id="tag-name"
            type="text"
            value={draft.name}
            onChange={e => update({
              name: e.target.value,
            })}
            required
            placeholder="e.g. skills:listening"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-color"
          >
            Color
            {" "}
            <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="tag-color"
            type="text"
            value={draft.color}
            onChange={e => update({
              color: e.target.value,
            })}
            placeholder="e.g. blue, #34d"
          />
        </div>
        <EditFormActions
          isSaving={isSaving}
          onCancel={onCancel}
          onDelete={onDelete}
          isNew={isNew}
          size="sm"
          trashIconClassName="size-3.5"
        />
      </form>
    </li>
  );
}
