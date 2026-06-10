import type { WeeklyRow } from "@/components/routines/weekly";
import type { SelectOption } from "@/utils";
import type { RoutineTemplate } from "@emstack/types/src";

import { useEffect, useState } from "react";

import { Loader2, Trash2Icon } from "lucide-react";

import { Input } from "@/components/input";
import { rowsToWeekly, weeklyToRows } from "@/components/routines/weekly";
import { WeeklyScheduleField } from "@/components/routines/WeeklyScheduleField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RoutineTemplateEditModalProps {
  open: boolean;
  template: RoutineTemplate | null;
  isNew?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (next: RoutineTemplate) => void;
  onDelete?: () => void;
  isSaving?: boolean;
  deleteDisabled?: boolean;
  taskOptions: SelectOption[];
  resourceOptions: SelectOption[];
}

export function RoutineTemplateEditModal({
  open,
  template,
  isNew = false,
  onOpenChange,
  onSave,
  onDelete,
  isSaving = false,
  deleteDisabled = false,
  taskOptions,
  resourceOptions,
}: RoutineTemplateEditModalProps) {
  const [label, setLabel] = useState(template?.label ?? "");
  const [rows, setRows] = useState<WeeklyRow[]>(weeklyToRows(template?.weekly));

  useEffect(() => {
    setLabel(template?.label ?? "");
    setRows(weeklyToRows(template?.weekly));
  }, [template]);

  if (!template) {
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!template) return;
    onSave({
      id: template.id,
      label,
      weekly: rowsToWeekly(rows),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Add Routine Template" : "Edit Routine Template"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="routine-template-label"
            >
              Label
            </label>
            <Input
              id="routine-template-label"
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              required
              placeholder="Template label (e.g. Summer Japanese)"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Weekly Schedule
            </span>
            <WeeklyScheduleField
              value={rows}
              onChange={setRows}
              taskOptions={taskOptions}
              resourceOptions={resourceOptions}
            />
          </div>
          <DialogFooter className="sm:justify-between">
            {onDelete && !isNew
              ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isSaving || deleteDisabled}
                >
                  <Trash2Icon className="size-4" />
                  Remove
                </Button>
              )
              : (
                <span />
              )}
            <div
              className="
                flex flex-col-reverse gap-2
                sm:flex-row
              "
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="animate-spin" />}
                Save
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
