import type {
  Module,
  ModuleGroup,
  TaskResource,
  TaskResourceLevel,
} from "@emstack/types";

const RESOURCE_LEVEL_OPTIONS: { value: TaskResourceLevel;
  label: string; }[] = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
];

export function getResourceLevelLabel(
  level: TaskResourceLevel | null | undefined,
): string {
  if (!level) {
    return "—";
  }
  return RESOURCE_LEVEL_OPTIONS.find(o => o.value === level)?.label ?? level;
}

export function getResourceLevelClass(
  level: TaskResourceLevel | null | undefined,
): string {
  switch (level) {
    case "low":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "medium":
      return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200";
    case "high":
      return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200";
    default:
      return "bg-muted text-muted-foreground border-muted-foreground/30";
  }
}

export type ResourceLevelKey
  = "easeOfStarting" | "timeNeeded" | "interactivity";

// A Resource reduced to its identity ({ id, name }) for a resource
// <select> option.
export interface ResourceSelectOption {
  id: string;
  name: string;
}

// The ease/time/interactivity values live on Resource / ModuleGroup / Module.
// Resolve from most-specific to least-specific:
//   Module → its parent ModuleGroup → Resource.
// When the row narrows to a Module that doesn't carry an override, walk up
// to the module's parent group (looked up via allModules/allModuleGroups
// since the row's joined moduleGroup may be null when only a module was
// selected) and then to the resource.
export function inheritedLevel(
  resource: TaskResource,
  key: ResourceLevelKey,
  allModules: Module[],
  allModuleGroups: ModuleGroup[],
): TaskResourceLevel | null {
  const fromModule = resource.module?.[key];
  if (fromModule) return fromModule;

  if (resource.moduleId) {
    const fullModule = allModules.find(m => m.id === resource.moduleId);
    if (fullModule?.moduleGroupId) {
      const parentGroup = allModuleGroups.find(
        g => g.id === fullModule.moduleGroupId,
      );
      const fromParent = parentGroup?.[key];
      if (fromParent) return fromParent;
    }
  }

  const fromRowGroup = resource.moduleGroup?.[key];
  if (fromRowGroup) return fromRowGroup;

  return resource.resource?.[key] ?? null;
}

// Most-specific first: Module > Module Group > Resource.
export function linkedResourceLabel(resource: TaskResource): string | null {
  return resource.resource
    ? [resource.module?.name, resource.moduleGroup?.name, resource.resource.name]
      .filter(Boolean)
      .join(" > ")
    : null;
}
