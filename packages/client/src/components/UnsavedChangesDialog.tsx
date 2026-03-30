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
 * 1. Compute a `hasChanges` boolean (e.g. by comparing current form values to
 *    their defaults using the `formHasChanges` utility).
 * 2. Render `<UnsavedChangesDialog hasChanges={hasChanges} />` anywhere in your
 *    page component.
 * 3. If the user should be allowed to navigate without the dialog in certain
 *    cases (e.g. a Cancel or Save button), set `hasChanges` to `false` before
 *    calling `navigate()` — for example via a ref that you toggle just before
 *    navigating.
 *
 * @example
 * ```tsx
 * const hasChanges = formHasChanges(currentValues, defaultValues);
 * return (
 *   <>
 *     <form>...</form>
 *     <UnsavedChangesDialog hasChanges={hasChanges} />
 *   </>
 * );
 * ```
 */
export function UnsavedChangesDialog({
  hasChanges,
}: {
  hasChanges: boolean;
}) {
  const blocker = useBlocker({
    condition: hasChanges,
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
