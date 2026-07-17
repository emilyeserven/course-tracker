import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TemplateSectionCrudArgs<T extends { id: string }> {
  queryKey: readonly unknown[];
  fetchFn: () => Promise<T[]>;
  createFn: (template: T) => Promise<unknown>;
  upsertFn: (template: T) => Promise<unknown>;
  deleteFn: (id: string) => Promise<unknown>;
  // Toast prefix, e.g. "Routine template" -> "Routine template saved".
  entityLabel: string;
}

// The template settings sections' shared CRUD machinery: list query,
// edit/create modal state, and the save / create / delete mutations (each
// invalidating the list, closing its modal, and toasting). Shared by the
// routine-template and criteria-template sections so the flow can't drift.
export function useTemplateSectionCrud<T extends { id: string }>({
  queryKey,
  fetchFn,
  createFn,
  upsertFn,
  deleteFn,
  entityLabel,
}: TemplateSectionCrudArgs<T>) {
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);

  const listQuery = useQuery({
    queryKey,
    queryFn: fetchFn,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey,
    });

  const upsertMutation = useMutation({
    mutationFn: upsertFn,
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      toast.success(`${entityLabel} saved`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      invalidate();
      setCreatingNew(false);
      toast.success(`${entityLabel} created`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      toast.success(`${entityLabel} deleted`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const templates = listQuery.data ?? [];

  return {
    templates,
    isPending: listQuery.isPending,
    editingId,
    setEditingId,
    creatingNew,
    setCreatingNew,
    editingTemplate: editingId
      ? (templates.find(t => t.id === editingId) ?? null)
      : null,
    saveTemplate: upsertMutation.mutate,
    createTemplate: createMutation.mutate,
    deleteTemplate: deleteMutation.mutate,
    isSaving: upsertMutation.isPending || deleteMutation.isPending,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
