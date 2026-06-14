import type { ControlledDialogProps } from "@/types/dialogProps";

import { QuickAddIntegrationDialog } from "./QuickAddIntegrationDialog";
import { useQuickAddReadwise } from "./useQuickAddReadwise";

import { Input } from "@/components/input";

export function QuickAddReadwiseDialog({
  open,
  onOpenChange,
}: ControlledDialogProps) {
  const {
    url,
    setUrl,
    title,
    setTitle,
    configured,
    handleSubmit,
    isPending,
    canSubmit,
  } = useQuickAddReadwise({
    open,
    onOpenChange,
  });

  return (
    <QuickAddIntegrationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Save to Readwise"
      description={(
        <>
          The article is tagged
          {" "}
          <code>from-coursetracker</code>
          .
        </>
      )}
      providerName="Readwise"
      configured={configured}
      isPending={isPending}
      canSubmit={canSubmit}
      submitLabel="Save"
      onSubmit={handleSubmit}
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
    </QuickAddIntegrationDialog>
  );
}
