export interface TaskTodo {
  id: string;
  taskId: string;
  name: string;
  isComplete: boolean;
  position?: number | null;
}
