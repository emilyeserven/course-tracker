import { useFieldContext } from "./fieldContext";

import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Input } from "@/components/forms/input";

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
