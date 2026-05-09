export interface TaskType {
  id: string;
  name: string;
  whenToUse?: string | null;
  tags: string[];
}
