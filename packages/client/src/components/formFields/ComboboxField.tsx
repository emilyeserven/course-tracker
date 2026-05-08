import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/combobox";
import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { useIsFieldInvalid } from "@/utils/useIsFieldInvalid";

interface ComboboxFieldProps {
  label: string;
  options: { value: string;
    label: string; }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ComboboxField({
  label,
  options,
  placeholder,
  className = "text-2xl",
  disabled,
}: ComboboxFieldProps) {
  const {
    field, isInvalid,
  } = useIsFieldInvalid<string>();

  const optionsMap = new Map(options.map(o => [o.value, o.label]));

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel className={className}>{label}</FieldLabel>
      <Combobox
        value={field.state.value || null}
        onValueChange={val => field.handleChange(val ?? "")}
        itemToStringLabel={val => optionsMap.get(val) ?? ""}
      >
        <ComboboxInput
          placeholder={placeholder}
          showClear
          onBlur={field.handleBlur}
          disabled={disabled}
        />
        <ComboboxContent>
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
