import { createContext } from "react";

export interface PageActionsSlotState {
  /** The header element that page actions portal into (null until mounted). */
  node: HTMLElement | null;
  /** Callback ref the header passes to register/clear the slot element. */
  setNode: (el: HTMLElement | null) => void;
}

export const PageActionsSlotContext
  = createContext<PageActionsSlotState | null>(null);
