import { useFieldContext } from "./fieldContext";

export function useIsFieldInvalid<T>() {
  const field = useFieldContext<T>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return {
    field,
    isInvalid,
  };
}
