import type { CreateConfig } from "@/components/formFields/ComboboxCreatePanel";
import type { SelectOption } from "@/utils";

import { useState } from "react";

import { toast } from "sonner";

interface UseComboboxCreateOptions {
  create: CreateConfig | undefined;
  options: SelectOption[];
  /** Applies the newly created option to the field (set / append). */
  onCreated: (newId: string) => void;
}

/**
 * Shared create-new-option flow for ComboboxField / MultiComboboxField:
 * tracks the typed input, decides when to offer the "Add new" row (non-empty
 * input with no exact label match), and runs the CreateConfig submit with
 * toast-on-error handling.
 */
export function useComboboxCreate({
  create,
  options,
  onCreated,
}: UseComboboxCreateOptions) {
  const [inputValue, setInputValue] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createInitialValue, setCreateInitialValue] = useState("");
  const [creating, setCreating] = useState(false);

  const trimmedInput = inputValue.trim();
  const hasExactMatch
    = trimmedInput.length > 0
      && options.some(o => o.label.toLowerCase() === trimmedInput.toLowerCase());

  const showAddRow = !!create && trimmedInput.length > 0 && !hasExactMatch;

  function openCreate() {
    setCreateInitialValue(trimmedInput);
    setCreateOpen(true);
  }

  async function handleCreateSubmit(values: Record<string, unknown>) {
    if (!create) return;
    setCreating(true);
    try {
      const newId = await create.onCreate(values);
      onCreated(newId);
      setCreateOpen(false);
      setInputValue("");
    }
    catch (err) {
      console.error(`Failed to create ${create.itemLabel}:`, err);
      toast.error(`Failed to create ${create.itemLabel}. Please try again.`);
    }
    finally {
      setCreating(false);
    }
  }

  return {
    setInputValue,
    trimmedInput,
    showAddRow,
    createOpen,
    setCreateOpen,
    createInitialValue,
    creating,
    openCreate,
    handleCreateSubmit,
  };
}
