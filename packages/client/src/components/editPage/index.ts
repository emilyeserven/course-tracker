// Single import surface for the shell shared by entity edit pages (page header,
// edit-form wrapper, footer, view/header button, tab strip, unsaved-changes
// guard, and the submit/cancel button). Aggregates components that live
// elsewhere — keep the implementations in their original homes; this only
// re-exports them so an edit page pulls its shell from one module.
export { EditForm } from "@/components/layout/EditForm";
export { EditPageFooter } from "@/components/layout/EditPageFooter";
export { EntityHeaderButton } from "@/components/layout/EntityHeaderButton";
export { PageHeader } from "@/components/layout/PageHeader";
export { Button } from "@/components/ui/button";
export { UnsavedChangesDialog } from "@/components/dialogs/UnsavedChangesDialog";
