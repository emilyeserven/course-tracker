export interface TaskTodo {
  id: string;
  taskId: string;
  name: string;
  isComplete: boolean;
  url?: string | null;
  position?: number | null;
}
