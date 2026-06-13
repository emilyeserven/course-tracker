import type { ControlledDialogProps } from "@/components/dialogProps";

import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTodoistTask, fetchSettings } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export function QuickAddTodoistDialog({
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

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Todoist task</DialogTitle>
          <DialogDescription>
            The task is labeled
            {" "}
            <code>from-coursetracker</code>
            .
          </DialogDescription>
        </DialogHeader>
        {configured
          ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (trimmedContent) {
                  mutation.mutate({
                    content: trimmedContent,
                    description: trimmedDescription || undefined,
                  });
                }
              }}
            >
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="quick-add-todoist-content"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Title
                </label>
                <Input
                  id="quick-add-todoist-content"
                  autoFocus
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What needs doing?"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="quick-add-todoist-description"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Description (optional)
                </label>
                <Textarea
                  id="quick-add-todoist-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add any extra detail"
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
                  disabled={!trimmedContent || mutation.isPending}
                >
                  {mutation.isPending && <Loader2 className="animate-spin" />}
                  Add
                </Button>
              </DialogFooter>
            </form>
          )
          : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Add a Todoist API key in
                {" "}
                <Link
                  to="/settings"
                  search={{
                    tab: "connections",
                  }}
                  onClick={() => onOpenChange(false)}
                  className="
                    text-primary underline-offset-2
                    hover:underline
                  "
                >
                  Settings
                </Link>
                {" "}
                to enable this.
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}
