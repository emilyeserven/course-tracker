// Field building blocks for the interaction quick-log form: the optional-select
// field control and the difficulty/progress/understanding option metadata.
// Grouping the re-exports here lets InteractionQuickLog import them as a single
// dependency (parallel to moduleAdminComponents.ts). This barrel only re-exports
// leaf modules — it does not import them back — so there is no circular dependency.
export {
  DIFFICULTY_OPTIONS,
  PROGRESS_LABEL,
  PROGRESS_OPTIONS,
  UNDERSTANDING_OPTIONS,
} from "./interactionMeta";
export { OptionalSelectField } from "./OptionalSelectField";
