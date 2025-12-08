import { Input } from "@/components/input";
import { Field, FieldLabel } from "@/componentsforms/field";

interface OnboardingInputProps {
  label: string;
  id: string;
  placeholder: string;
}
export function OnboardingInput({
  label,
  id,
  placeholder,
}: OnboardingInputProps) {
  return (

    <Field>
      <FieldLabel
        htmlFor={id}
        className="text-2xl"
      >{label}
      </FieldLabel>
      <Input
        id={id}
        autoComplete="off"
        placeholder={placeholder}
        className={`
          h-12 w-full
          md:text-2xl
        `}
      />
    </Field>
  );
}
