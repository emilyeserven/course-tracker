import { Field, FieldLabel } from "@/components/forms/field";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { Label } from "@/components/ui/label";
import { useFieldContext } from "@/utils/fieldContext";

interface RadioGroupFieldProps {
  label: string;
  options: { value: string;
    label: string; }[];
  className?: string;
  labelClassName?: string;
}

export function RadioGroupField({
  label,
  options,
  className = "text-2xl",
  labelClassName = "capitalize",
}: RadioGroupFieldProps) {
  const field = useFieldContext<string>();

  return (
    <Field>
      <FieldLabel className={className}>{label}</FieldLabel>
      <RadioGroup
        value={field.state.value}
        onValueChange={val => field.handleChange(val)}
        className="flex flex-row gap-4"
      >
        {options.map(option => (
          <div
            key={option.value}
            className="flex items-center gap-2"
          >
            <RadioGroupItem
              value={option.value}
              id={`${field.name}-${option.value}`}
            />
            <Label
              htmlFor={`${field.name}-${option.value}`}
              className={labelClassName}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </Field>
  );
}
