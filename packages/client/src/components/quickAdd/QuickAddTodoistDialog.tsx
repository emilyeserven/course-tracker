import type { ControlledDialogProps } from "@/components/dialogProps";

import { QuickAddIntegrationDialog } from "./QuickAddIntegrationDialog";
import { useQuickAddTodoist } from "./useQuickAddTodoist";

import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";

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
    <QuickAddIntegrationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Todoist task"
      description={(
        <>
          The task is labeled
          {" "}
          <code>from-coursetracker</code>
          .
        </>
      )}
      providerName="Todoist"
      configured={configured}
      isPending={isPending}
      canSubmit={canSubmit}
      submitLabel="Add"
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
    </QuickAddIntegrationDialog>
  );
}
