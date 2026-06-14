import type { ControlledDialogProps } from "@/types/dialogProps";

import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchSettings, saveReadwiseArticle } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

/**
 * Bundles the form state, settings lookup, and create mutation for
 * {@link QuickAddReadwiseDialog} so the component stays presentational.
 */
export function useQuickAddReadwise({
  open,
  onOpenChange,
}: ControlledDialogProps) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) {
      setUrl("");
      setTitle("");
    }
  }, [open]);

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => fetchSettings(),
  });
  const configured = settingsQuery.data?.readwiseConfigured ?? false;

  const mutation = useMutation({
    mutationFn: (input: { url: string;
      title?: string; }) =>
      saveReadwiseArticle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.readwise.readingList(),
      });
      onOpenChange(false);
      toast.success("Saved to Readwise");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const trimmedUrl = url.trim();
  const trimmedTitle = title.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmedUrl) {
      mutation.mutate({
        url: trimmedUrl,
        title: trimmedTitle || undefined,
      });
    }
  };

  return {
    url,
    setUrl,
    title,
    setTitle,
    configured,
    handleSubmit,
    isPending: mutation.isPending,
    canSubmit: Boolean(trimmedUrl),
  };
}
