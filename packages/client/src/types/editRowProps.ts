// Shared prop cluster for inline "edit row" components (tag groups, tags, task
// types). Each row's props interface extends this; row-specific fields and any
// delete-disabled props are added by the leaf interfaces.
export interface EditRowBaseProps {
  isNew?: boolean;
  isSaving?: boolean;
  onCancel: () => void;
  onDelete?: () => void;
}
