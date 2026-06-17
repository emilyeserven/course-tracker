import { createPortal } from "react-dom";

import { usePageActionsSlot } from "@/hooks/usePageActionsSlot";

/**
 * Renders its children into the shared top-bar action slot (opposite the
 * breadcrumbs). Listing pages put their "Add New" button here; detail pages put
 * their "Edit" button here. Renders nothing until the slot element has mounted.
 */
export function PageActions({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    node,
  } = usePageActionsSlot();
  if (!node) return null;
  return createPortal(children, node);
}
