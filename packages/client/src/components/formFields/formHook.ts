import { createFormHook } from "@tanstack/react-form";

import { DatePickerField } from "./DatePickerField";
import { fieldContext, formContext } from "./fieldContext";
import { InputField } from "./InputField";
import { NumberField } from "./NumberField";
import { RadioGroupField } from "./RadioGroupField";
import { TextareaField } from "./TextareaField";

export const {
  useAppForm,
} = createFormHook({
  fieldComponents: {
    InputField,
    TextareaField,
    NumberField,
    RadioGroupField,
    DatePickerField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});
