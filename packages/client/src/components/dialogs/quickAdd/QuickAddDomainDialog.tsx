import type { ControlledDialogProps } from "@/types/dialogProps";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { QuickAddNameDialog } from "./QuickAddNameDialog";

import { createDomain } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export function QuickAddDomainDialog({
  open,
  onOpenChange,
}: ControlledDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    // Domains use `title` for display (every other entity uses `name`).
    mutationFn: (domainTitle: string) =>
      createDomain({
        title: domainTitle,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.domains.list(),
      });
      onOpenChange(false);
      toast.success("Domain created", {
        action: {
          label: "Edit",
          onClick: () =>
            navigate({
              to: "/domains/$id/edit",
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

  return (
    <QuickAddNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Domain"
      entity="domain"
      placeholder="Domain name"
      isPending={mutation.isPending}
      onSubmit={name => mutation.mutate(name)}
    />
  );
}
