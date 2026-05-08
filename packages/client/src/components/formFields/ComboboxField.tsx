import type { CreateConfig } from "@/components/formFields/ComboboxCreatePanel";

import { useState } from "react";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/combobox";
import { ComboboxCreatePanel } from "@/components/formFields/ComboboxCreatePanel";
import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { useIsFieldInvalid } from "@/utils/useIsFieldInvalid";

interface ComboboxFieldProps {
  label: string;
  options: { value: string;
    label: string; }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  create?: CreateConfig;
}

export function ComboboxField({
  label,
  options,
  placeholder,
  className = "text-2xl",
  disabled,
  create,
}: ComboboxFieldProps) {
  const {
    field, isInvalid,
  } = useIsFieldInvalid<string>();

  const [inputValue, setInputValue] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const optionsMap = new Map(options.map(o => [o.value, o.label]));

  const trimmedInput = inputValue.trim();
  const hasExactMatch = trimmedInput.length > 0
    && options.some(o => o.label.toLowerCase() === trimmedInput.toLowerCase());

  const showAddRow = !!create && trimmedInput.length > 0 && !hasExactMatch;

  function openCreate() {
    setCreateOpen(true);
  }

  async function handleCreateSubmit(values: Record<string, unknown>) {
    if (!create) return;
    setCreating(true);
    try {
      const newId = await create.onCreate(values);
      field.handleChange(newId);
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

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel className={className}>{label}</FieldLabel>
      <Combobox
        items={options.map(o => o.value)}
        value={field.state.value || null}
        onValueChange={val => field.handleChange(val ?? "")}
        onInputValueChange={val => setInputValue(val)}
        itemToStringLabel={(val: string) => optionsMap.get(val) ?? ""}
      >
        <ComboboxInput
          placeholder={placeholder}
          showClear
          onBlur={field.handleBlur}
          disabled={disabled}
        />
        <ComboboxContent>
          {showAddRow && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                openCreate();
              }}
              className="
                flex w-full items-center gap-2 border-b border-border p-2
                text-left text-sm
                hover:bg-accent hover:text-accent-foreground
              "
            >
              <PlusIcon className="size-4" />
              <span>
                Add new
                {" "}
                {create?.itemLabel}
                :
                {" "}
                <strong>{trimmedInput}</strong>
              </span>
            </button>
          )}
          <ComboboxEmpty>
            {create
              ? (
                <div className="flex w-full flex-col items-center gap-2 py-3">
                  <span>No items found.</span>
                  {trimmedInput && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        openCreate();
                      }}
                    >
                      <PlusIcon className="size-4" />
                      Add new
                      {" "}
                      {create.itemLabel}
                    </Button>
                  )}
                </div>
              )
              : (
                "No items found."
              )}
          </ComboboxEmpty>
          <ComboboxList>
            {(value: string) => (
              <ComboboxItem
                key={value}
                value={value}
              >
                {optionsMap.get(value) ?? value}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {create && createOpen && (
        <ComboboxCreatePanel
          config={create}
          initialPrimaryValue={trimmedInput}
          submitting={creating}
          onCancel={() => setCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
