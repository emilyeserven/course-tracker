import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/combobox";
import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { useFieldContext } from "@/utils/fieldContext";

interface ComboboxFieldProps {
  label: string;
  options: { value: string;
    label: string; }[];
  placeholder?: string;
  className?: string;
}

export function ComboboxField({
  label,
  options,
  placeholder,
  className = "text-2xl",
}: ComboboxFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

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
