import type { ControlledDialogProps } from "@/types/dialogProps";

import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createTodoistTask, fetchSettings } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

/**
 * Bundles the form state, settings lookup, and create mutation for
 * {@link QuickAddTodoistDialog} so the component stays presentational.
 */
export function useQuickAddTodoist({
  open,
  onOpenChange,
}: ControlledDialogProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setContent("");
      setDescription("");
    }
  }, [open]);

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => fetchSettings(),
  });
  const configured = settingsQuery.data?.todoistConfigured ?? false;

  const mutation = useMutation({
    mutationFn: (input: { content: string;
      description?: string; }) =>
      createTodoistTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todoist.tasks(),
      });
      onOpenChange(false);
      toast.success("Added to Todoist");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const trimmedContent = content.trim();
  const trimmedDescription = description.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmedContent) {
      mutation.mutate({
        content: trimmedContent,
        description: trimmedDescription || undefined,
      });
    }
  };

  return {
    content,
    setContent,
    description,
    setDescription,
    configured,
    handleSubmit,
    isPending: mutation.isPending,
    canSubmit: Boolean(trimmedContent),
  };
}
