import type { ControlledDialogProps } from "@/types/dialogProps";
import type { RoutineMode } from "@emstack/types";

import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { createRoutine } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

/**
 * Bundles the form state, reset-on-open, and create mutation for
 * {@link QuickAddRoutineDialog} so the component stays presentational.
 */
export function useQuickAddRoutine({
  open,
  onOpenChange,
}: ControlledDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [mode, setMode] = useState<RoutineMode>("weekly");

  useEffect(() => {
    if (open) {
      setName("");
      setMode("weekly");
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: (input: { name: string;
      mode: RoutineMode; }) =>
      createRoutine({
        name: input.name,
        mode: input.mode,
        status: "active",
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.routines.list(),
      });
      onOpenChange(false);
      toast.success("Routine created", {
        action: {
          label: "Edit",
          onClick: () =>
            navigate({
              to: "/routines/$id/edit",
              params: {
                id: result.id,
              },
            }),
        },
      });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const trimmed = name.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed) {
      mutation.mutate({
        name: trimmed,
        mode,
      });
    }
  };

  return {
    name,
    setName,
    mode,
    setMode,
    handleSubmit,
    isPending: mutation.isPending,
    canSubmit: Boolean(trimmed),
  };
}
