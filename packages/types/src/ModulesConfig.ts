// Per-resource module-hierarchy configuration. Rather than renaming the
// hierarchy, a resource points at a saved hint template (managed in Settings →
// Resource Settings) whose group/module hints appear as placeholder guidance
// when editing this resource's groups and modules. Stored as a JSONB column on
// the resource.
export interface ModulesConfig {
  // Id of the selected HintTemplate (app_settings.moduleHintTemplates[].id).
  // null/undefined means no template — the name fields use their default hints.
  hintTemplateId?: string | null;
}

// The hierarchy labels are no longer customizable per resource (the old rename
// feature was a misunderstanding); the module-admin UI always shows these.
export const DEFAULT_GROUP_LABEL = "Group";
export const DEFAULT_MODULE_LABEL = "Module";

export const DEFAULT_MODULES_CONFIG: ModulesConfig = {
  hintTemplateId: null,
};
