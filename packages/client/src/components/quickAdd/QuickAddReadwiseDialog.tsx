import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchSettings, saveReadwiseArticle } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

interface QuickAddReadwiseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddReadwiseDialog({
  open,
  onOpenChange,
}: QuickAddReadwiseDialogProps) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) {
      setUrl("");
      setTitle("");
    }
  }, [open]);

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => fetchSettings(),
  });
  const configured = settingsQuery.data?.readwiseConfigured ?? false;

  const mutation = useMutation({
    mutationFn: (input: {
      url: string;
      title?: string;
    }) => saveReadwiseArticle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.readwise.readingList(),
      });
      onOpenChange(false);
      toast.success("Saved to Readwise");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const trimmedUrl = url.trim();
  const trimmedTitle = title.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Save to Readwise</DialogTitle>
          <DialogDescription>
            The article is tagged
            {" "}
            <code>from-coursetracker</code>
            .
          </DialogDescription>
        </DialogHeader>
        {configured
          ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (trimmedUrl) {
                  mutation.mutate({
                    url: trimmedUrl,
                    title: trimmedTitle || undefined,
                  });
                }
              }}
            >
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="quick-add-readwise-url"
                  className="text-xs font-medium text-muted-foreground"
                >
                  URL
                </label>
                <Input
                  id="quick-add-readwise-url"
                  type="url"
                  autoFocus
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="quick-add-readwise-title"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Title (optional)
                </label>
                <Input
                  id="quick-add-readwise-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Leave blank to use the page title"
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
                  disabled={!trimmedUrl || mutation.isPending}
                >
                  {mutation.isPending && <Loader2 className="animate-spin" />}
                  Save
                </Button>
              </DialogFooter>
            </form>
          )
          : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Add a Readwise API key in
                {" "}
                <Link
                  to="/settings"
                  onClick={() => onOpenChange(false)}
                  className="
                    text-primary underline-offset-2
                    hover:underline
                  "
                >
                  Settings
                </Link>
                {" "}
                to enable this.
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}
