import type { ControlledDialogProps } from "@/components/dialogProps";

import { Link } from "@tanstack/react-router";

import { QuickAddDialogFooter } from "./QuickAddDialogFooter";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuickAddIntegrationDialogProps extends ControlledDialogProps {
  /** Dialog heading, e.g. "Save to Readwise". */
  title: string;
  /** Optional sub-heading, e.g. the "tagged from-coursetracker" line. */
  description?: React.ReactNode;
  /** Integration name shown in the "add an API key" prompt, e.g. "Readwise". */
  providerName: string;
  /** Whether the integration's API key is set; gates the form vs. the Settings prompt. */
  configured: boolean;
  /** Whether the create mutation is in flight (disables submit, shows a spinner). */
  isPending: boolean;
  /** Whether the form has enough input to submit. */
  canSubmit: boolean;
  /** Label on the submit button, e.g. "Save", "Add". */
  submitLabel: string;
  /** Form submit handler owned by the caller's hook. */
  onSubmit: (e: React.FormEvent) => void;
  /** The integration-specific input fields. */
  children: React.ReactNode;
}

/**
 * Presentational shell for the integration quick-add dialogs (Readwise, Todoist)
 * that gate behind a configured API key. Owns the dialog chrome, header, the
 * configured/unconfigured branch, and — when configured — the form wrapper and
 * footer; callers pass the input fields as children plus the mutation state.
 */
export function QuickAddIntegrationDialog({
  open,
  onOpenChange,
  title,
  description,
  providerName,
  configured,
  isPending,
  canSubmit,
  submitLabel,
  onSubmit,
  children,
}: QuickAddIntegrationDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {configured
          ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={onSubmit}
            >
              {children}
              <QuickAddDialogFooter
                submitLabel={submitLabel}
                isPending={isPending}
                canSubmit={canSubmit}
                onCancel={() => onOpenChange(false)}
              />
            </form>
          )
          : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Add a
                {" "}
                {providerName}
                {" "}
                API key in
                {" "}
                <Link
                  to="/settings"
                  search={{
                    tab: "connections",
                  }}
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
