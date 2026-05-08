import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Textarea } from "@/components/forms/textarea";
import { useIsFieldInvalid } from "@/utils/useIsFieldInvalid";

interface TextareaFieldProps {
  label: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function TextareaField({
  label,
  className = "text-2xl",
  placeholder,
  disabled,
}: TextareaFieldProps) {
  const {
    field, isInvalid,
  } = useIsFieldInvalid<string>();

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
        disabled={disabled}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
