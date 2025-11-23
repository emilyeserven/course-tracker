import type { ReactFormExtendedApi } from "@tanstack/react-form";

import { Field, FieldError, FieldLabel } from "@/components/field";
import { Input } from "@/components/input";

interface TopicFieldProps {
  form: ReactFormExtendedApi<any, any, any, any, any, any, any, any, any, any, any, any>;
  condition: boolean;
  name: string;
  label: string;
}
export function TopicField({
  form,
  condition,
  name,
  label,
}: TopicFieldProps) {
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
              className="text-2xl"
            >{label}
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="Memes"
              autoComplete="off"
              className={`
                h-11
                md:text-xl
              `}
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
