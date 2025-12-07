export interface Topic {
  id: string;
  name: string;
  description?: string | null;
  reason?: string | null;
  courseCount?: number;
}
