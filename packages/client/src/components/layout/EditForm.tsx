import type { FormEvent, ReactNode } from "react";

interface EditFormProps {
  /** Called when the form is submitted (after preventDefault). */
  onSubmit: () => void;
  /** Layout classes for the form element. */
  className: string;
  children: ReactNode;
}

/**
 * Edit-page form wrapper: a `<form>` that prevents the default submit and
 * delegates to the TanStack Form `handleSubmit`. Shared by the entity edit
 * pages and their detail/criteria tabs.
 */
export function EditForm({
  onSubmit, className, children,
}: EditFormProps) {
  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit();
      }}
      className={className}
    >
      {children}
    </form>
  );
}
