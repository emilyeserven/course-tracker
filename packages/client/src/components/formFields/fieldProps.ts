// Shared props common to every TanStack-Form field component in this folder.
// Each `*FieldProps` interface extends this and adds its own distinctive props.
export interface BaseFieldProps {
  label: string;
  className?: string;
}
