// A reusable preset of placeholder "hints" for naming a resource's module
// hierarchy. Managed in Settings → Resource Settings and stored as a JSONB array
// on the singleton app_settings row. A resource references one by id via
// ModulesConfig.hintTemplateId; the picked template's hints surface as
// placeholder text in that resource's group/module name fields. These are hints
// only — they never rename the "Group"/"Module" labels.
export interface HintTemplate {
  id: string;
  name: string; // e.g. "Book", "Video Course"
  groupHint: string; // placeholder shown in the Group Name field
  moduleHint: string; // placeholder shown in the Module Name field
}
