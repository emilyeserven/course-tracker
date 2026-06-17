import { useContext } from "react";

import { PageActionsSlotContext } from "@/context/PageActionsSlotContext";

export const usePageActionsSlot = () => {
  const context = useContext(PageActionsSlotContext);

  if (!context) {
    throw new Error("usePageActionsSlot must be used within a PageActionsProvider");
  }
  return context;
};
