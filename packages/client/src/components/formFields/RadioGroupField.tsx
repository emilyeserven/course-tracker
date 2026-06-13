import type { SelectOption } from "@/utils";

import { Field, FieldLabel } from "@/components/forms/field";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  changedFieldClass,
  useFieldChangeHighlight,
} from "@/utils/fieldChangeHighlight";
import { useFieldContext } from "@/utils/fieldContext";

interface RadioGroupFieldProps {
  label: string;
  options: SelectOption[];
  className?: string;
  labelClassName?: string;
}

export function RadioGroupField({
  label,
  options,
  className,
  labelClassName = "capitalize",
}: RadioGroupFieldProps) {
  const field = useFieldContext<string>();
  const showChanged = useFieldChangeHighlight();

  return (
    <Field className={cn(showChanged && changedFieldClass)}>
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
