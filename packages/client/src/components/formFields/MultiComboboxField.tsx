import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/combobox";
import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { useFieldContext } from "@/utils/fieldContext";

interface MultiComboboxFieldProps {
  label: string;
  options: { value: string;
    label: string; }[];
  placeholder?: string;
  className?: string;
}

export function MultiComboboxField({
  label,
  options,
  placeholder,
  className = "text-2xl",
}: MultiComboboxFieldProps) {
  const field = useFieldContext<string[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const anchor = useComboboxAnchor();

  const optionsMap = new Map(options.map(o => [o.value, o.label]));

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel className={className}>{label}</FieldLabel>
      <Combobox
        multiple
        value={field.state.value || []}
        onValueChange={val => field.handleChange(val)}
        itemToStringLabel={val => optionsMap.get(val) ?? ""}
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
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {options.map(option => (
              <ComboboxItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
