import { useState } from "react";

import { PageActionsSlotContext } from "./PageActionsSlotContext";

/**
 * Holds a reference to the top-bar action slot so pages can portal an action
 * button into the shared header without prop drilling through the single
 * router `Outlet`.
 */
export function PageActionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [node, setNode] = useState<HTMLElement | null>(null);

  return (
    <PageActionsSlotContext.Provider
      value={{
        node,
        setNode,
      }}
    >
      {children}
    </PageActionsSlotContext.Provider>
  );
}
