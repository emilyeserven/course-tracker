import { useEffect, useState } from "react";

import { CheckIcon, PencilIcon } from "lucide-react";

import { Input } from "@/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoteEditButtonProps {
  initialNote: string | null;
  disabled?: boolean;
  onSave: (note: string) => void;
}

export function NoteEditButton({
  initialNote,
  disabled = false,
  onSave,
}: NoteEditButtonProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialNote ?? "");

  useEffect(() => {
    if (open) {
      setValue(initialNote ?? "");
    }
  }, [open, initialNote]);

  const hasNote = !!initialNote;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          title={hasNote ? "Edit note" : "Add note"}
          aria-label={hasNote ? "Edit note" : "Add note"}
          className={cn(
            !hasNote && `
              opacity-0
              group-focus-within:opacity-100
              group-hover:opacity-100
            `,
            hasNote && "text-foreground",
          )}
        >
          <PencilIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-2"
        align="end"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(value);
            setOpen(false);
          }}
          className="flex flex-row items-center gap-2"
        >
          <Input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Add a note..."
            autoFocus
            maxLength={500}
          />
          <Button
            type="submit"
            size="icon-sm"
            aria-label="Save note"
            title="Save note"
          >
            <CheckIcon className="size-4" />
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
