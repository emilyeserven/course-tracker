import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTask } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

interface QuickAddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddTaskDialog({
  open,
  onOpenChange,
}: QuickAddTaskDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

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

  const trimmed = name.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed) mutation.mutate(trimmed);
          }}
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="quick-add-task-name"
              className="text-xs font-medium text-muted-foreground"
            >
              Name
            </label>
            <Input
              id="quick-add-task-name"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Task name"
              maxLength={255}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!trimmed || mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
