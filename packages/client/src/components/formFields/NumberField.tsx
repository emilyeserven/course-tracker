import type { ReactFormExtendedApi } from "@tanstack/react-form";

import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Input } from "@/components/forms/input";

interface NumberFieldProps {
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
  condition?: boolean;
  name: string;
  label: string;
  className?: string;
  min?: number;
  step?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validators?: any;
}

export function NumberField({
  form,
  condition = true,
  name,
  label,
  className = "text-2xl",
  min,
  step,
  validators,
}: NumberFieldProps) {
  if (!condition) {
    return <></>;
  }

  return (
    <form.Field
      name={name}
      validators={validators}
      children={(field) => {
        const isInvalid
          = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel
              htmlFor={field.name}
              className={className}
            >
              {label}
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              min={min}
              step={step}
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={e =>
                field.handleChange(e.target.value ? Number(e.target.value) : 0)}
              aria-invalid={isInvalid}
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    />
  );
}
