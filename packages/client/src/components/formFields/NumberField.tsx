import { useFieldContext } from "./fieldContext";

import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Input } from "@/components/forms/input";

interface NumberFieldProps {
  label: string;
  className?: string;
  min?: number;
  step?: string;
}

export function NumberField({
  label,
  className = "text-2xl",
  min,
  step,
}: NumberFieldProps) {
  const field = useFieldContext<number>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

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
}
