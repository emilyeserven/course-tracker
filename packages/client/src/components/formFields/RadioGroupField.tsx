import type { ReactFormExtendedApi } from "@tanstack/react-form";

import { Field, FieldLabel } from "@/components/forms/field";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { Label } from "@/components/ui/label";

interface RadioGroupFieldProps {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  form: ReactFormExtendedApi<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  name: string;
  label: string;
  options: { value: string;
    label: string; }[];
  className?: string;
  labelClassName?: string;
}

export function RadioGroupField({
  form,
  name,
  label,
  options,
  className = "text-2xl",
  labelClassName = "capitalize",
}: RadioGroupFieldProps) {
  return (
    <form.Field
      name={name}
      children={field => (
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
                  id={`${name}-${option.value}`}
                />
                <Label
                  htmlFor={`${name}-${option.value}`}
                  className={labelClassName}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Field>
      )}
    />
  );
}
