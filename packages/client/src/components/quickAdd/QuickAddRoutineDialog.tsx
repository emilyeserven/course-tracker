import type { ControlledDialogProps } from "@/components/dialogProps";
import type { RoutineMode } from "@emstack/types";

import { QuickAddDialogFooter } from "./QuickAddDialogFooter";
import { useQuickAddRoutine } from "./useQuickAddRoutine";

import { Input } from "@/components/input";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function QuickAddRoutineDialog({
  open,
  onOpenChange,
}: ControlledDialogProps) {
  const {
    name,
    setName,
    mode,
    setMode,
    handleSubmit,
    isPending,
    canSubmit,
  } = useQuickAddRoutine({
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
          <DialogTitle>Add Routine</DialogTitle>
          <DialogDescription>
            Name your routine and choose whether it repeats weekly or daily.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="quick-add-routine-name"
              className="text-xs font-medium text-muted-foreground"
            >
              Name
            </label>
            <Input
              id="quick-add-routine-name"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Routine name"
              maxLength={255}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Type
            </span>
            <RadioGroup
              value={mode}
              onValueChange={value => setMode(value as RoutineMode)}
            >
              <label
                htmlFor="quick-add-routine-weekly"
                className="flex items-center gap-2 text-sm"
              >
                <RadioGroupItem
                  id="quick-add-routine-weekly"
                  value="weekly"
                />
                Weekly Schedule
              </label>
              <label
                htmlFor="quick-add-routine-daily"
                className="flex items-center gap-2 text-sm"
              >
                <RadioGroupItem
                  id="quick-add-routine-daily"
                  value="daily"
                />
                Daily Task
              </label>
            </RadioGroup>
          </div>
          <QuickAddDialogFooter
            submitLabel="Create"
            isPending={isPending}
            canSubmit={canSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
