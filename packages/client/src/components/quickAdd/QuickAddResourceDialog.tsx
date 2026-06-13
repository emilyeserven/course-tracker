import type { ControlledDialogProps } from "@/components/dialogProps";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { upsertResource, uuidv4 } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

import { QuickAddNameDialog } from "./QuickAddNameDialog";

interface QuickAddResourceDialogProps extends ControlledDialogProps {
  /**
   * Called with the new resource's id after a successful create. When provided,
   * the success toast skips the "Edit"/navigate action so callers (e.g. an
   * inline combobox) can keep the user in place and auto-select the resource.
   */
  onCreated?: (id: string) => void;
  /** Seeds the name input when the dialog opens (e.g. the combobox's typed text). */
  initialName?: string;
}

export function QuickAddResourceDialog({
  open,
  onOpenChange,
  onCreated,
  initialName,
}: QuickAddResourceDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    // Resources have no POST create endpoint — a PUT with a fresh id upserts,
    // matching how the full edit page creates new resources.
    mutationFn: async (resourceName: string) => {
      const id = uuidv4();
      await upsertResource(id, {
        name: resourceName,
      });
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.resources.list(),
      });
      onOpenChange(false);
      if (onCreated) {
        onCreated(id);
        toast.success("Resource created");
        return;
      }
      toast.success("Resource created", {
        action: {
          label: "Edit",
          onClick: () =>
            navigate({
              to: "/resources/$id/edit",
              params: {
                id,
              },
            }),
        },
      });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return (
    <QuickAddNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Resource"
      entity="resource"
      placeholder="Resource name"
      initialName={initialName}
      isPending={mutation.isPending}
      onSubmit={name => mutation.mutate(name)}
    />
  );
}
