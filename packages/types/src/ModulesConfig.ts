// Per-resource naming conventions for the module hierarchy. Lets each resource
// label what a "group" and a "module" are called in its domain (e.g. a Book
// might call them "Chapter" and "Section"). Stored as a JSONB column on the
// resource; the module-admin UI reads these labels instead of hardcoded ones.
export interface ModulesConfig {
  groupLabel: string;
  moduleLabel: string;
}

export const DEFAULT_MODULES_CONFIG: ModulesConfig = {
  groupLabel: "Group",
  moduleLabel: "Module",
};
