import type { CreateConfig } from "@/components/formFields/ComboboxCreatePanel";
import type { BaseFieldProps } from "@/types/fieldProps";
import type { SelectOption } from "@/utils";

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
  // Incidental overlap of shared formField imports + prop interface.
  // fallow-ignore-next-line code-duplication
} from "@/components/combobox";
import { ComboboxAddNewRow } from "@/components/formFields/ComboboxAddNewRow";
import { ComboboxCreatePanel } from "@/components/formFields/ComboboxCreatePanel";
import { useComboboxCreate } from "@/components/formFields/useComboboxCreate";
import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { cn } from "@/lib/utils";
import {
  changedFieldClass,
  useFieldChangeHighlight,
} from "@/utils/fieldChangeHighlight";
import { useIsFieldInvalid } from "@/utils/useIsFieldInvalid";

interface MultiComboboxFieldProps extends BaseFieldProps {
  options: SelectOption[];
  placeholder?: string;
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
  options: SelectOption[],
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
      // Prefix-grouping helper that incidentally mirrors TagsInput's partitionTags.
      // fallow-ignore-next-line code-duplication
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

  const {
    setInputValue,
    trimmedInput,
    showAddRow,
    createOpen,
    setCreateOpen,
    createInitialValue,
    creating,
    openCreate,
    handleCreateSubmit,
  } = useComboboxCreate({
    create,
    options,
    onCreated: (newId) => {
      const current = field.state.value || [];
      if (!current.includes(newId)) {
        field.handleChange([...current, newId]);
      }
    },
  });

  const optionsMap = new Map(options.map(o => [o.value, o.label]));

  return (
    <Field
      data-invalid={isInvalid}
      className={cn(showChanged && changedFieldClass)}
    >
      <FieldLabel className={className}>{label}</FieldLabel>
      <Combobox
        multiple
        items={
          groupByPrefix
            ? partitionOptions(options)
            : options.map(o => o.value)
        }
        value={field.state.value || []}
        onValueChange={val => field.handleChange(val)}
        onInputValueChange={val => setInputValue(val)}
        itemToStringLabel={(val: string) => optionsMap.get(val) ?? ""}
      >
        <ComboboxChips ref={anchor}>
          {(field.state.value || []).map(val => (
            <ComboboxChip key={val}>{optionsMap.get(val) ?? val}</ComboboxChip>
          ))}
          <ComboboxChipsInput
            placeholder={placeholder}
            onBlur={field.handleBlur}
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          {showAddRow && (
            // Structural overlap with TagsInput's grouped combobox dropdown.
            // fallow-ignore-next-line code-duplication
            <ComboboxAddNewRow
              itemLabel={create?.itemLabel}
              trimmedInput={trimmedInput}
              onOpenCreate={openCreate}
            />
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
