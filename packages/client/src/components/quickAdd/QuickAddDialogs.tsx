import type { QuickAddKey } from "./quickAddOptions";

import { QuickAddProviderDialog } from "./QuickAddProviderDialog";
import { QuickAddReadwiseDialog } from "./QuickAddReadwiseDialog";
import { QuickAddResourceDialog } from "./QuickAddResourceDialog";
import { QuickAddRoutineDialog } from "./QuickAddRoutineDialog";
import { QuickAddTaskDialog } from "./QuickAddTaskDialog";
import { QuickAddTodoistDialog } from "./QuickAddTodoistDialog";

interface QuickAddDialogsProps {
  active: QuickAddKey | null;
  onClose: () => void;
}

/**
 * Renders all Quick Add modals once and opens the one matching `active`. Lifted
 * to the root so the desktop dropdown and the mobile menu share one set.
 */
export function QuickAddDialogs({
  active,
  onClose,
}: QuickAddDialogsProps) {
  const onOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <>
      <QuickAddReadwiseDialog
        open={active === "readwise"}
        onOpenChange={onOpenChange}
      />
      <QuickAddTodoistDialog
        open={active === "todoist"}
        onOpenChange={onOpenChange}
      />
      <QuickAddResourceDialog
        open={active === "resource"}
        onOpenChange={onOpenChange}
      />
      <QuickAddProviderDialog
        open={active === "provider"}
        onOpenChange={onOpenChange}
      />
      <QuickAddRoutineDialog
        open={active === "routine"}
        onOpenChange={onOpenChange}
      />
      <QuickAddTaskDialog
        open={active === "task"}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
