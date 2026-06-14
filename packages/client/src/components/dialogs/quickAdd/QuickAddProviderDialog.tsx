import type { ControlledDialogProps } from "@/types/dialogProps";

import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { QuickAddDialogFooter } from "./QuickAddDialogFooter";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NAME_MAX_LENGTH } from "@/constants/stringLimits";
import { createProvider } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export function QuickAddProviderDialog({
  open,
  onOpenChange,
}: ControlledDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setUrl("");
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: (input: { name: string;
      url: string; }) => createProvider(input),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.providers.list(),
      });
      onOpenChange(false);
      toast.success("Provider created", {
        action: {
          label: "Edit",
          onClick: () =>
            navigate({
              to: "/providers/$id/edit",
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

  const trimmedName = name.trim();
  const trimmedUrl = url.trim();
  const canSubmit = trimmedName.length > 0 && trimmedUrl.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Provider</DialogTitle>
          <DialogDescription>
            Enter a name and URL to add a new provider.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) {
              mutation.mutate({
                name: trimmedName,
                url: trimmedUrl,
              });
            }
          }}
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="quick-add-provider-name"
              className="text-xs font-medium text-muted-foreground"
            >
              Name
            </label>
            <Input
              id="quick-add-provider-name"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Provider name"
              maxLength={NAME_MAX_LENGTH}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="quick-add-provider-url"
              className="text-xs font-medium text-muted-foreground"
            >
              URL
            </label>
            <Input
              id="quick-add-provider-url"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              maxLength={NAME_MAX_LENGTH}
            />
          </div>
          <QuickAddDialogFooter
            submitLabel="Create"
            isPending={mutation.isPending}
            canSubmit={canSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
