import type { TaskTodo } from "@emstack/types";

import { useState } from "react";

import { Trash2Icon } from "lucide-react";

import { DAILY_STATUS_OPTIONS } from "@/components/dailies/dailyStatusMeta";
import { BookmarkPicker } from "@/components/formFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEXT_MAX_LENGTH } from "@/constants/stringLimits";

interface TodoEditRowProps {
  todo: TaskTodo;
  isNew?: boolean;
  isSaving: boolean;
  onSave: (todo: TaskTodo) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

// Inline editor for a single todo: name, status, due date, associated
// bookmarks (with optional section narrowing), location and url.
export function TodoEditRow({
  todo,
  isNew = false,
  isSaving,
  onSave,
  onCancel,
  onDelete,
}: TodoEditRowProps) {
  const [draft, setDraft] = useState<TaskTodo>(todo);

  function patch(next: Partial<TaskTodo>) {
    setDraft(prev => ({
      ...prev,
      ...next,
    }));
  }

  function handleSave() {
    const name = draft.name.trim();
    if (!name) return;
    onSave({
      ...draft,
      name,
      note: draft.note?.trim() || null,
      location: draft.location?.trim() || null,
      url: draft.url?.trim() || null,
    });
  }

  return (
    <li className="flex flex-col gap-3 bg-muted/30 p-3">
      <div
        className="
          flex flex-col gap-2
          sm:flex-row sm:items-end
        "
      >
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            To-do
          </label>
          <Input
            value={draft.name}
            onChange={e =>
              patch({
                name: e.target.value,
              })}
            placeholder="What needs doing?"
            maxLength={TEXT_MAX_LENGTH}
            disabled={isSaving}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select
            value={draft.status}
            onValueChange={value =>
              patch({
                status: value as TaskTodo["status"],
              })}
            disabled={isSaving}
          >
            <SelectTrigger
              size="sm"
              aria-label="Status"
              className="min-w-32"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAILY_STATUS_OPTIONS.map(o => (
                <SelectItem
                  key={o.value}
                  value={o.value}
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`todo-due-${draft.id}`}
            className="text-xs font-medium text-muted-foreground"
          >
            Due date
          </label>
          <Input
            id={`todo-due-${draft.id}`}
            type="date"
            value={draft.dueDate ?? ""}
            onChange={e =>
              patch({
                dueDate: e.target.value || null,
              })}
            disabled={isSaving}
            className="w-40"
          />
        </div>
      </div>

      <div
        className="
          flex flex-col gap-2
          sm:flex-row
        "
      >
        <Input
          value={draft.url ?? ""}
          onChange={e =>
            patch({
              url: e.target.value,
            })}
          placeholder="Link (https://...)"
          type="url"
          disabled={isSaving}
          className="flex-1"
        />
        <Input
          value={draft.note ?? ""}
          onChange={e =>
            patch({
              note: e.target.value,
            })}
          placeholder="Note (optional)"
          maxLength={TEXT_MAX_LENGTH}
          disabled={isSaving}
          className="flex-1"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Bookmarks
        </label>
        <BookmarkPicker
          value={draft.bookmarks ?? []}
          onChange={next =>
            patch({
              bookmarks: next,
            })}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !draft.name.trim()}
          >
            {isNew ? "Add to-do" : "Save"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isSaving}
            className="text-destructive"
          >
            <Trash2Icon className="size-3.5" />
            Delete
          </Button>
        )}
      </div>
    </li>
  );
}
