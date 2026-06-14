import { useBlocker } from "@tanstack/react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Displays a confirmation dialog when the user tries to navigate away from a
 * page with unsaved changes.
 *
 * Usage:
 * 1. Pass a `shouldBlockFn` callback that returns `true` when navigation should
 *    be blocked (e.g. when the form has unsaved changes). This callback is
 *    evaluated at navigation time, so it can read refs and other mutable values.
 * 2. Render `<UnsavedChangesDialog shouldBlockFn={...} />` anywhere in your
 *    page component.
 *
 * @example
 * ```tsx
 * const skipBlocker = useRef(false);
 * const hasChanges = formHasChanges(currentValues, defaultValues);
 * return (
 *   <>
 *     <form>...</form>
 *     <UnsavedChangesDialog shouldBlockFn={() => hasChanges && !skipBlocker.current} />
 *   </>
 * );
 * ```
 */
export function UnsavedChangesDialog({
  shouldBlockFn,
}: {
  shouldBlockFn: () => boolean;
}) {
  const blocker = useBlocker({
    shouldBlockFn,
    withResolver: true,
  });

  return (
    <AlertDialog open={blocker.status === "blocked"}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Are you sure you want to leave this page?
            Your changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={blocker.reset}>
            Stay on page
          </AlertDialogCancel>
          <AlertDialogAction onClick={blocker.proceed}>
            Leave without saving
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
