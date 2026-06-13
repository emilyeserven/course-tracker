// The pieces that compose `ResourcesTable`: row-level metadata helpers, the
// inline editor row, and the display row. Grouped so the table imports them as
// one dependency.
export { inheritedLevel, linkedResourceLabel } from "./resourceMeta";
export { COLUMN_COUNT, EditingRow } from "./TaskResourceEditingRow";
export { TaskResourceRow } from "./TaskResourceRow";
