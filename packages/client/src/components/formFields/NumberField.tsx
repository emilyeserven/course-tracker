import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Input } from "@/components/forms/input";
import { useIsFieldInvalid } from "@/utils/useIsFieldInvalid";

interface NumberFieldProps {
  label: string;
  className?: string;
  min?: number;
  step?: string;
  disabled?: boolean;
}

export function NumberField({
  label,
  className = "text-2xl",
  min,
  step,
  disabled,
}: NumberFieldProps) {
  const {
    field, isInvalid,
  } = useIsFieldInvalid<number | null>();

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
        disabled={disabled}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={e =>
          field.handleChange(e.target.value ? Number(e.target.value) : null)}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
