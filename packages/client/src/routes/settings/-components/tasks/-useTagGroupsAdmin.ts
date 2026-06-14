import type { TagDraft, TagGroupDraft } from "./-tagDrafts";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createTag,
  createTagGroup,
  deleteSingleTag,
  deleteSingleTagGroup,
  fetchTagGroups,
  upsertTag,
  upsertTagGroup,
} from "@/utils";

// State, queries, and the six tag/group mutations behind TagGroupsAdmin, lifted
// here so the component is a slim composer over the row components.
export function useTagGroupsAdmin() {
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

  return {
    groups,
    isPending: groupsQuery.isPending,
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
  };
}
