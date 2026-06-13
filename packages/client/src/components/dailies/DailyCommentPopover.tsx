import type { Daily } from "@emstack/types";

import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, MessageSquareIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/popover";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import { useHoverPopover } from "@/hooks/useHoverPopover";
import { cn } from "@/lib/utils";
import {
  getTodayKey,
  upsertDaily,
  withCompletionNote,
} from "@/utils";

interface DailyCommentPopoverProps {
  daily: Daily;
  buttonClassName?: string;
}

export function DailyCommentPopover({
  daily,
  buttonClassName,
}: DailyCommentPopoverProps) {
  const todayKey = getTodayKey();
  const queryClient = useQueryClient();
  const note
    = daily.completions.find(c => c.date === todayKey)?.note?.trim() || "";
  const hasNote = note.length > 0;

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

  const mutation = useMutation({
    mutationFn: (nextNote: string | null) => {
      const completions = withCompletionNote(daily, todayKey, nextNote);
      return upsertDaily(daily.id, {
        name: daily.name,
        location: daily.location ?? null,
        description: daily.description ?? null,
        completions,
        courseProviderId: daily.provider?.id ?? null,
        resourceId: daily.resource?.id ?? null,
        taskId: daily.taskId ?? daily.task?.id ?? null,
        status: daily.status ?? "active",
        criteria: daily.criteria ?? {},
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["dailies"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["daily", daily.id],
        }),
      ]);
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to save comment.");
    },
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(draft.trim() || null);
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
          aria-label={hasNote
            ? `View comment for ${daily.name}`
            : `Add comment for ${daily.name}`}
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
            hasNote
              ? "text-foreground"
              : "text-muted-foreground/40",
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
                maxLength={500}
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
