/** Props for a dialog whose open state is controlled by its parent. */
export interface ControlledDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
