// Module-admin sub-components rendered by ResourceModulesAdmin: the group/module
// edit cards, the display row, the suggest dialog, and the quick-log form.
// Grouping the re-exports here lets ResourceModulesAdmin import them as a single
// dependency. This barrel only re-exports leaf sub-components — it does not
// import the folder, and the sub-components keep their own direct imports, so
// there is no circular dependency.
export { GroupEditCard, GroupMetaChips } from "./GroupEditCard";
export { InteractionQuickLog } from "./InteractionQuickLog";
export { ModuleDisplayRow } from "./ModuleDisplayRow";
export { ModuleEditCard } from "./ModuleEditCard";
export { ModuleSuggestDialog } from "./ModuleSuggestDialog";
