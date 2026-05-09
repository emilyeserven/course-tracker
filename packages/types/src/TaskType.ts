// TODO(tag-reform-followup): retire TaskType in favor of TagGroup + Tag once the
// new tag system fully replaces Task Types on tasks.
export interface TaskType {
  id: string;
  name: string;
  whenToUse?: string | null;
  tags: string[];
}
