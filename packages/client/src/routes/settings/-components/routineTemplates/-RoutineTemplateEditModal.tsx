import type { WeeklyRow } from "@/components/routines/weekly";
import type { ControlledDialogProps } from "@/types/dialogProps";
import type { SelectOption } from "@/utils";
import type { RoutineTemplate } from "@emstack/types";

import { useEffect, useState } from "react";

import { EditModalFooter } from "@/components/dialogs/EditModalFooter";
import { rowsToWeekly, weeklyToRows } from "@/components/routines/weekly";
import { WeeklyScheduleField } from "@/components/routines/WeeklyScheduleField";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface RoutineTemplateEditModalProps extends ControlledDialogProps {
  template: RoutineTemplate | null;
  isNew?: boolean;
  onSave: (next: RoutineTemplate) => void;
  onDelete?: () => void;
  isSaving?: boolean;
  deleteDisabled?: boolean;
  taskOptions: SelectOption[];
  resourceOptions: SelectOption[];
  moduleGroupsByResource: Map<string, SelectOption[]>;
  modulesByResource: Map<string, SelectOption[]>;
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
  moduleGroupsByResource,
  modulesByResource,
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
          <DialogDescription>
            {isNew
              ? "Name the template and set its weekly schedule of tasks and resources."
              : "Update the template's label and weekly schedule of tasks and resources."}
          </DialogDescription>
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
              moduleGroupsByResource={moduleGroupsByResource}
              modulesByResource={modulesByResource}
            />
          </div>
          <EditModalFooter
            isNew={isNew}
            isSaving={isSaving}
            deleteDisabled={deleteDisabled}
            onDelete={onDelete}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
