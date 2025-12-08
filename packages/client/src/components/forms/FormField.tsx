import type { ReactFormExtendedApi } from "@tanstack/react-form";

import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Input } from "@/components/forms/input";

interface FormFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: ReactFormExtendedApi<any, any, any, any, any, any, any, any, any, any, any, any>;
  condition?: boolean;
  name: string;
  label: string;
  className?: string;
  fieldClassName?: string;
  placeholder?: string;
}

export function FormField({
  form,
  condition = true,
  name,
  label,
  className = "text-2xl",
  placeholder,
  fieldClassName = "h-11 md:text-xl",
}: FormFieldProps) {
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
            >{label}
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder={placeholder}
              autoComplete="off"
              className={fieldClassName}
            />
            {isInvalid && (
              <FieldError errors={field.state.meta.errors} />
            )}
          </Field>
        );
      }}
    />
  );
}
