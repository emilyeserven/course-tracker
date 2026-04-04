import type { ReactFormExtendedApi } from "@tanstack/react-form";

import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Textarea } from "@/components/forms/textarea";

interface TextareaFieldProps {
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
  placeholder?: string;
}

export function TextareaField({
  form,
  condition = true,
  name,
  label,
  className = "text-2xl",
  placeholder,
}: TextareaFieldProps) {
  if (!condition) {
    return <></>;
  }

  return (
    <form.Field
      name={name}
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
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder={placeholder}
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    />
  );
}
