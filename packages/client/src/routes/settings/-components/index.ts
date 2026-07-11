// One import surface for the section components the /settings route composes,
// grouped by tab into subfolder barrels. Each section imports its own
// dependencies directly (never this index), so this re-export barrel introduces
// no cycle.
export { TaskTypesSection, TagGroupsAdmin } from "./tasks";
export {
  CriteriaTemplatesSection,
  RoutineTemplatesSection,
} from "./routineTemplates";
export { ResourceHintTemplatesSection } from "./resources";
export { DashboardLayoutsSection } from "./dashboard";
export {
  ReadwiseSection,
  TodoistSection,
  GoogleCalendarSection,
} from "./connections";
export { ThemeSection } from "./display";
export { DataToolsSection } from "./advanced";
