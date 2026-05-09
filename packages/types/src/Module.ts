export interface Module {
  id: string;
  courseId: string;
  moduleGroupId?: string | null;
  name: string;
  description?: string | null;
  url?: string | null;
  minutesLength?: number | null;
  isComplete: boolean;
  position?: number | null;
}
