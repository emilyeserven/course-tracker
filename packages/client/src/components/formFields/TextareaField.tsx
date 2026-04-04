import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Textarea } from "@/components/forms/textarea";
import { useFieldContext } from "@/utils/fieldContext";

interface TextareaFieldProps {
  label: string;
  className?: string;
  placeholder?: string;
}

export function TextareaField({
  label,
  className = "text-2xl",
  placeholder,
}: TextareaFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

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
}
