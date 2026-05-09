import type { CreateConfig } from "@/components/formFields/ComboboxCreatePanel";

import { useState } from "react";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/combobox";
import { ComboboxCreatePanel } from "@/components/formFields/ComboboxCreatePanel";
import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { useIsFieldInvalid } from "@/utils/useIsFieldInvalid";

interface MultiComboboxFieldProps {
  label: string;
  options: { value: string;
    label: string; }[];
  placeholder?: string;
  className?: string;
  create?: CreateConfig;
  /**
   * When true, options whose value matches `group:value` are partitioned by
   * the substring before the first `:` and rendered under a group header.
   * Options without a colon fall under an "Other" group rendered last.
   */
  groupByPrefix?: boolean;
}

function partitionOptions(options: { value: string;
  label: string; }[]) {
  const groups = new Map<string, { value: string;
    label: string; }[]>();
  const otherKey = "Other";
  for (const opt of options) {
    const idx = opt.value.indexOf(":");
    const groupName = idx > 0 ? opt.value.slice(0, idx) : otherKey;
    const bucket = groups.get(groupName);
    if (bucket) {
      bucket.push(opt);
    }
    else {
      groups.set(groupName, [opt]);
    }
  }
  const others = groups.get(otherKey);
  if (others) {
    groups.delete(otherKey);
    groups.set(otherKey, others);
  }
  return groups;
}

function stripGroup(label: string) {
  const idx = label.indexOf(":");
  return idx > 0 ? label.slice(idx + 1) : label;
}

export function MultiComboboxField({
  label,
  options,
  placeholder,
  className = "text-2xl",
  create,
  groupByPrefix = false,
}: MultiComboboxFieldProps) {
  const {
    field, isInvalid,
  } = useIsFieldInvalid<string[]>();
  const anchor = useComboboxAnchor();

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
      const current = field.state.value || [];
      if (!current.includes(newId)) {
        field.handleChange([...current, newId]);
      }
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
        multiple
        {...(groupByPrefix
          ? {}
          : {
            items: options.map(o => o.value),
          })}
        value={field.state.value || []}
        onValueChange={val => field.handleChange(val)}
        onInputValueChange={val => setInputValue(val)}
        itemToStringLabel={(val: string) => optionsMap.get(val) ?? ""}
      >
        <ComboboxChips ref={anchor}>
          {(field.state.value || []).map(val => (
            <ComboboxChip
              key={val}
              value={val}
            >
              {optionsMap.get(val) ?? val}
            </ComboboxChip>
          ))}
          <ComboboxChipsInput
            placeholder={placeholder}
            onBlur={field.handleBlur}
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
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
            {groupByPrefix
              ? Array.from(partitionOptions(options).entries()).map(
                ([groupName, groupOptions]) => (
                  <ComboboxGroup key={groupName}>
                    <ComboboxLabel>{groupName}</ComboboxLabel>
                    {groupOptions.map(o => (
                      <ComboboxItem
                        key={o.value}
                        value={o.value}
                      >
                        {stripGroup(o.label)}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                ),
              )
              : (value: string) => (
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
