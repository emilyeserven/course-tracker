import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { upsertResource, uuidv4 } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

interface QuickAddResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddResourceDialog({
  open,
  onOpenChange,
}: QuickAddResourceDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  const mutation = useMutation({
    // Resources have no POST create endpoint — a PUT with a fresh id upserts,
    // matching how the full edit page creates new resources.
    mutationFn: async (resourceName: string) => {
      const id = uuidv4();
      await upsertResource(id, {
        name: resourceName,
      });
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.resources.list(),
      });
      onOpenChange(false);
      toast.success("Resource created", {
        action: {
          label: "Edit",
          onClick: () =>
            navigate({
              to: "/resources/$id/edit",
              params: {
                id,
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
          <DialogTitle>Add Resource</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed) mutation.mutate(trimmed);
          }}
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="quick-add-resource-name"
              className="text-xs font-medium text-muted-foreground"
            >
              Name
            </label>
            <Input
              id="quick-add-resource-name"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Resource name"
              maxLength={255}
            />
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
