import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createRoutine } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

type RoutineMode = "weekly" | "daily";

interface QuickAddRoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddRoutineDialog({
  open,
  onOpenChange,
}: QuickAddRoutineDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [mode, setMode] = useState<RoutineMode>("weekly");

  useEffect(() => {
    if (open) {
      setName("");
      setMode("weekly");
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: (input: {
      name: string;
      mode: RoutineMode;
    }) =>
      createRoutine({
        name: input.name,
        mode: input.mode,
        status: "active",
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.routines.list(),
      });
      onOpenChange(false);
      toast.success("Routine created", {
        action: {
          label: "Edit",
          onClick: () =>
            navigate({
              to: "/routines/$id/edit",
              params: {
                id: result.id,
              },
            }),
        },
      });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const trimmed = name.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Routine</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed) {
              mutation.mutate({
                name: trimmed,
                mode,
              });
            }
          }}
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!trimmed || mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
