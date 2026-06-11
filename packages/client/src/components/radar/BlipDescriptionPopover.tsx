import { useEffect, useState } from "react";

import { PencilIcon } from "lucide-react";

import { Input } from "@/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";
import { Button } from "@/components/ui/button";

interface BlipDescriptionPopoverProps {
  value: string;
  onChange: (value: string) => void;
}

export function BlipDescriptionPopover({
  value,
  onChange,
}: BlipDescriptionPopoverProps) {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);

  // Keep the draft in sync if the saved value changes from elsewhere while
  // the popover is closed.
  useEffect(() => {
    if (!open) {
      setDraft(value);
    }
  }, [value, open]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-6 p-0"
          aria-label="Edit blip description"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <PencilIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="left"
        className="w-72"
        onClick={e => e.stopPropagation()}
      >
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onChange(draft.trim());
            setOpen(false);
          }}
        >
          <label className="text-xs font-medium">Blip description</label>
          <Input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Add a description for this blip"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft(value);
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
            >
              Save
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
