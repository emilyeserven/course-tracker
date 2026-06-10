import type { CreateConfig } from "@/components/formFields/ComboboxCreatePanel";

import { useState } from "react";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
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
import { cn } from "@/lib/utils";
import { changedFieldClass, useFieldChangeHighlight } from "@/utils/fieldChangeHighlight";
import { useIsFieldInvalid } from "@/utils/useIsFieldInvalid";

interface ComboboxOption {
  value: string;
  label: string;
  group?: string;
}

interface MultiComboboxFieldProps {
  label: string;
  options: ComboboxOption[];
  placeholder?: string;
  className?: string;
  create?: CreateConfig;
  /**
   * When true, options are rendered under group headers (and the dropdown filters
   * per group, hiding empty ones). An option's group comes from its explicit
   * `group` field, falling back to the substring before the first `:` in its
   * value; options with neither fall under an "Other" group rendered last.
   */
  groupByPrefix?: boolean;
}

// Group option values into Base UI's grouped-items shape (`{ value, items }[]`,
// where `value` is the header label and `items` are the option values). Passing
// this as the combobox `items` lets Base UI filter within each group and hide
// empty ones. Groups keep first-appearance order, with "Other" forced last.
function partitionOptions(
  options: ComboboxOption[],
): { value: string;
  items: string[]; }[] {
  const groups = new Map<string, string[]>();
  const otherKey = "Other";
  for (const opt of options) {
    let groupName = opt.group;
    if (!groupName) {
      const idx = opt.value.indexOf(":");
      groupName = idx > 0 ? opt.value.slice(0, idx) : otherKey;
    }
    const bucket = groups.get(groupName);
    if (bucket) {
      bucket.push(opt.value);
    }
    else {
      groups.set(groupName, [opt.value]);
    }
  }
  const others = groups.get(otherKey);
  if (others) {
    groups.delete(otherKey);
    groups.set(otherKey, others);
  }
  return Array.from(groups.entries()).map(([value, items]) => ({
    value,
    items,
  }));
}

function stripGroup(label: string) {
  const idx = label.indexOf(":");
  return idx > 0 ? label.slice(idx + 1) : label;
}

export function MultiComboboxField({
  label,
  options,
  placeholder,
  className,
  create,
  groupByPrefix = false,
}: MultiComboboxFieldProps) {
  const {
    field, isInvalid,
  } = useIsFieldInvalid<string[]>();
  const showChanged = useFieldChangeHighlight();
  const anchor = useComboboxAnchor();

  const [inputValue, setInputValue] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createInitialValue, setCreateInitialValue] = useState("");
  const [creating, setCreating] = useState(false);

  const optionsMap = new Map(options.map(o => [o.value, o.label]));

  const trimmedInput = inputValue.trim();
  const hasExactMatch = trimmedInput.length > 0
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
    <Field
      data-invalid={isInvalid}
      className={cn(showChanged && changedFieldClass)}
    >
      <FieldLabel className={className}>{label}</FieldLabel>
      <Combobox
        multiple
        items={
          groupByPrefix ? partitionOptions(options) : options.map(o => o.value)
        }
        value={field.state.value || []}
        onValueChange={val => field.handleChange(val)}
        onInputValueChange={val => setInputValue(val)}
        itemToStringLabel={(val: string) => optionsMap.get(val) ?? ""}
      >
        <ComboboxChips ref={anchor}>
          {(field.state.value || []).map(val => (
            <ComboboxChip key={val}>
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
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {groupByPrefix
              ? (group: { value: string;
                items: string[]; }) => (
                <ComboboxGroup
                  key={group.value}
                  items={group.items}
                >
                  <ComboboxLabel>{group.value}</ComboboxLabel>
                  <ComboboxCollection>
                    {(value: string) => (
                      <ComboboxItem
                        key={value}
                        value={value}
                      >
                        {stripGroup(optionsMap.get(value) ?? value)}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
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
          initialPrimaryValue={createInitialValue}
          submitting={creating}
          onCancel={() => setCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
