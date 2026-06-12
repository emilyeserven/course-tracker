import type { CreateConfig } from "@/components/formFields/ComboboxCreatePanel";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/combobox";
import { ComboboxAddNewRow } from "@/components/formFields/ComboboxAddNewRow";
import { ComboboxCreatePanel } from "@/components/formFields/ComboboxCreatePanel";
import { useComboboxCreate } from "@/components/formFields/useComboboxCreate";
import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { cn } from "@/lib/utils";
import { changedFieldClass, useFieldChangeHighlight } from "@/utils/fieldChangeHighlight";
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
  className,
  disabled,
  create,
}: ComboboxFieldProps) {
  const {
    field, isInvalid,
  } = useIsFieldInvalid<string>();
  const showChanged = useFieldChangeHighlight();

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
    // Field-shell wiring shared with MultiComboboxField (single vs multi value).
    // fallow-ignore-next-line code-duplication
  } = useComboboxCreate({
    create,
    options,
    onCreated: newId => field.handleChange(newId),
  });

  const optionsMap = new Map(options.map(o => [o.value, o.label]));

  return (
    <Field
      data-invalid={isInvalid}
      className={cn(showChanged && changedFieldClass)}
    >
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
            <ComboboxAddNewRow
              itemLabel={create?.itemLabel}
              trimmedInput={trimmedInput}
              onOpenCreate={openCreate}
            />
          )}
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {
              // Item render + create-panel tail shared with MultiComboboxField.
              // fallow-ignore-next-line code-duplication
              (value: string) => (
                <ComboboxItem
                  key={value}
                  value={value}
                >
                  {optionsMap.get(value) ?? value}
                </ComboboxItem>
              )
            }
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
