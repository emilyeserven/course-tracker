import type { ControlledDialogProps } from "@/types/dialogProps";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { QuickAddNameDialog } from "./QuickAddNameDialog";

import { createTopic } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export function QuickAddTopicDialog({
  open,
  onOpenChange,
}: ControlledDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (topicName: string) =>
      createTopic({
        name: topicName,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.topics.list(),
      });
      onOpenChange(false);
      toast.success("Topic created", {
        action: {
          label: "Edit",
          onClick: () =>
            navigate({
              to: "/topics/$id/edit",
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
      title="Add Topic"
      entity="topic"
      placeholder="Topic name"
      isPending={mutation.isPending}
      onSubmit={name => mutation.mutate(name)}
    />
  );
}
