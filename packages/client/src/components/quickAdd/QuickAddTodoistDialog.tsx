import type { ControlledDialogProps } from "@/components/dialogProps";

import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { useQuickAddTodoist } from "./useQuickAddTodoist";

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

export function QuickAddTodoistDialog({
  open,
  onOpenChange,
}: ControlledDialogProps) {
  const {
    content,
    setContent,
    description,
    setDescription,
    configured,
    handleSubmit,
    isPending,
    canSubmit,
  } = useQuickAddTodoist({
    open,
    onOpenChange,
  });

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
              onSubmit={handleSubmit}
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
                  disabled={!canSubmit || isPending}
                >
                  {isPending && <Loader2 className="animate-spin" />}
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
