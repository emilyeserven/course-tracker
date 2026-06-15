import type { WeeklyEntry } from "./weekly";
import type { SelectOption } from "@/utils";

interface ModuleNarrowingFieldsProps {
  // Prefix for the controls' aria-labels (kept stable so tests/stories can
  // target e.g. "Monday module group").
  ariaPrefix: string;
  row: WeeklyEntry;
  // Module groups / modules belonging to the row's chosen resource.
  groupOptions: SelectOption[];
  moduleOptions: SelectOption[];
  onChange: (patch: Partial<WeeklyEntry>) => void;
}

// The module-narrowing controls for a resource schedule entry: a module-group
// select plus a module select scoped to the chosen group. The two are
// hierarchical — a chosen module implies its parent group (reflected in the
// group select), and the module select is disabled until a group is picked.
export function ModuleNarrowingFields({
  ariaPrefix,
  row,
  groupOptions,
  moduleOptions,
  onChange,
}: ModuleNarrowingFieldsProps) {
  const selectedModule = row.moduleId
    ? moduleOptions.find(o => o.value === row.moduleId)
    : undefined;
  // A chosen module implies its parent group; otherwise use the explicitly
  // chosen group. "" = whole resource (no narrowing).
  const effectiveGroupId = row.moduleGroupId || selectedModule?.group || "";
  // The module dropdown is scoped to the chosen group and disabled until one is
  // picked — a module can only be chosen from within a group.
  const groupModuleOptions = effectiveGroupId
    ? moduleOptions.filter(o => (o.group ?? "") === effectiveGroupId)
    : [];

  return (
    <div
      className="
        grid grid-cols-1 gap-1.5
        sm:grid-cols-2
      "
    >
      <select
        aria-label={`${ariaPrefix} module group`}
        value={effectiveGroupId}
        onChange={e =>
          // Choosing a group (or clearing to whole resource) always resets the
          // specific module — the module list changes with the group.
          onChange({
            moduleGroupId: e.target.value,
            moduleId: "",
          })}
        className="flex h-9 w-full rounded-md border bg-background px-2 text-sm"
      >
        <option value="">— Whole resource —</option>
        {groupOptions.map(g => (
          <option
            key={g.value}
            value={g.value}
          >
            {g.label}
          </option>
        ))}
      </select>
      <select
        aria-label={`${ariaPrefix} module`}
        value={row.moduleId}
        disabled={!effectiveGroupId}
        onChange={(e) => {
          const moduleId = e.target.value;
          // Picking a module: its group is implied, so drop the explicit group.
          // Clearing back to "Whole Group": keep the group so it doesn't fall
          // back to the whole resource.
          onChange({
            moduleId,
            moduleGroupId: moduleId ? "" : effectiveGroupId,
          });
        }}
        className="flex h-9 w-full rounded-md border bg-background px-2 text-sm"
      >
        <option value="">
          {effectiveGroupId ? "Whole Group" : "— Select a group first —"}
        </option>
        {groupModuleOptions.map(m => (
          <option
            key={m.value}
            value={m.value}
          >
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
