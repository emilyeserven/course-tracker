import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Input } from "@/components/forms/input";
import { useIsFieldInvalid } from "@/utils/useIsFieldInvalid";

interface InputFieldProps {
  label: string;
  className?: string;
  fieldClassName?: string;
  placeholder?: string;
}

export function InputField({
  label,
  className = "text-2xl",
  placeholder,
  fieldClassName = "h-11 md:text-xl",
}: InputFieldProps) {
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
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
