import type { Daily } from "@emstack/types";

import { useEffect, useState } from "react";

import { CheckIcon, MessageSquareIcon, PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { TEXT_MAX_LENGTH } from "@/constants/stringLimits";
import { useDailyComment } from "@/hooks/useDailyComment";
import { useHoverPopover } from "@/hooks/useHoverPopover";
import { cn } from "@/lib/utils";

interface DailyCommentPopoverProps {
  daily: Daily;
  buttonClassName?: string;
}

export function DailyCommentPopover({
  daily,
  buttonClassName,
}: DailyCommentPopoverProps) {
  const {
    note, hasNote, mutation,
  } = useDailyComment(daily);

  const {
    open, setOpen, cancelClose, handleOpen, handleClose,
  }
    = useHoverPopover();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note);

  useEffect(() => {
    if (!open) {
      return;
    }
    setIsEditing(!hasNote);
    setDraft(note);
  }, [open, hasNote, note]);

  const handleHoverOpen = () => {
    if (!hasNote || isEditing) {
      return;
    }
    handleOpen();
  };

  const handleHoverClose = () => {
    if (isEditing) {
      return;
    }
    handleClose();
  };

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(draft.trim() || null, {
      onSuccess: () => setOpen(false),
    });
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setIsEditing(false);
        }
        setOpen(next);
      }}
    >
      <PopoverAnchor asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={
            hasNote
              ? `View comment for ${daily.name}`
              : `Add comment for ${daily.name}`
          }
          aria-haspopup="dialog"
          aria-expanded={open}
          title={hasNote ? "View comment" : "Add comment"}
          onClick={() => {
            cancelClose();
            if (!hasNote) {
              setIsEditing(true);
            }
            setOpen(true);
          }}
          onMouseEnter={handleHoverOpen}
          onMouseLeave={handleHoverClose}
          onFocus={handleHoverOpen}
          onBlur={handleHoverClose}
          className={cn(
            hasNote ? "text-foreground" : "text-muted-foreground/40",
            buttonClassName,
          )}
        >
          <MessageSquareIcon className="size-3.5" />
        </Button>
      </PopoverAnchor>
      <PopoverContent
        className="w-80 p-3"
        align="end"
        onMouseEnter={cancelClose}
        onMouseLeave={handleHoverClose}
        onOpenAutoFocus={(e) => {
          if (!isEditing) {
            e.preventDefault();
          }
        }}
      >
        {hasNote && !isEditing
          ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm whitespace-pre-wrap">{note}</p>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraft(note);
                    setIsEditing(true);
                  }}
                >
                  <PencilIcon className="size-3.5" />
                  Edit
                </Button>
              </div>
            </div>
          )
          : (
            <form
              onSubmit={handleSave}
              className="flex flex-col gap-2"
            >
              <Textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Add a comment..."
                autoFocus
                maxLength={TEXT_MAX_LENGTH}
                className="min-h-20"
              />
              <div className="flex justify-end gap-2">
                {hasNote && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDraft(note);
                      setIsEditing(false);
                    }}
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={mutation.isPending}
                >
                  <CheckIcon className="size-3.5" />
                  Save
                </Button>
              </div>
            </form>
          )}
      </PopoverContent>
    </Popover>
  );
}
