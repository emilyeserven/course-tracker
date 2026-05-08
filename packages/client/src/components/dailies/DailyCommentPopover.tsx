import type { Daily } from "@emstack/types/src";

import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, MessageSquareIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/forms/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { upsertDaily } from "@/utils";

interface DailyCommentPopoverProps {
  daily: Daily;
}

export function DailyCommentPopover({
  daily,
}: DailyCommentPopoverProps) {
  const queryClient = useQueryClient();
  const description = daily.description?.trim() || "";
  const hasDescription = description.length > 0;

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(description);

  useEffect(() => {
    if (!open) {
      return;
    }
    setIsEditing(!hasDescription);
    setDraft(description);
  }, [open, hasDescription, description]);

  const mutation = useMutation({
    mutationFn: (nextDescription: string | null) => {
      return upsertDaily(daily.id, {
        name: daily.name,
        location: daily.location ?? null,
        description: nextDescription,
        completions: daily.completions,
        courseProviderId: daily.provider?.id ?? null,
        courseId: daily.course?.id ?? null,
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
      toast.error("Failed to save description.");
    },
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(draft.trim() || null);
  }

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
          aria-label={hasDescription
            ? `View description for ${daily.name}`
            : `Add description for ${daily.name}`}
          title={hasDescription ? "View description" : "Add description"}
          className={cn(
            "text-muted-foreground",
            hasDescription && "text-foreground",
          )}
        >
          <MessageSquareIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-3"
        align="end"
      >
        {hasDescription && !isEditing
          ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm whitespace-pre-wrap">{description}</p>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraft(description);
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
                placeholder="Add a description..."
                autoFocus
                maxLength={500}
                className="min-h-20"
              />
              <div className="flex justify-end gap-2">
                {hasDescription && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDraft(description);
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
