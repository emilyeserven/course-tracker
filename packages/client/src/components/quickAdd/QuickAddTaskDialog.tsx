import type { ControlledDialogProps } from "@/components/dialogProps";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { QuickAddNameDialog } from "./QuickAddNameDialog";

import { createTask } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export function QuickAddTaskDialog({
  open,
  onOpenChange,
}: ControlledDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (taskName: string) =>
      createTask({
        name: taskName,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(),
      });
      onOpenChange(false);
      toast.success("Task created", {
        action: {
          label: "Edit",
          onClick: () =>
            navigate({
              to: "/tasks/$id/edit",
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
      title="Add Task"
      entity="task"
      placeholder="Task name"
      isPending={mutation.isPending}
      onSubmit={name => mutation.mutate(name)}
    />
  );
}
