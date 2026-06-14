import type { DragEndEvent } from "@dnd-kit/core";

import {
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

/** Shared dnd-kit collision detection for the module-admin sortable lists. */
export const reorderCollisionDetection = closestCenter;

/** Constrain dragging to the vertical axis — these are single-column lists. */
export const reorderModifiers = [restrictToVerticalAxis];

/**
 * Pointer + keyboard sensors shared by the module-admin sortable lists. A small
 * activation distance keeps a plain click on the drag handle from starting a
 * drag, and the keyboard sensor gives arrow-key reordering for accessibility.
 */
export function useReorderSensors() {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
}

/**
 * Resolve a drag-end event into a reordered copy of `list` and hand it to
 * `persist`. No-ops when the dragged item didn't move. Generic over any row
 * with a string `id` so groups and modules share one handler.
 */
export function handleListDragEnd<T extends { id: string }>(
  event: DragEndEvent,
  list: T[],
  persist: (next: T[]) => void,
) {
  const {
    active, over,
  } = event;
  if (!over || active.id === over.id) return;
  const oldIndex = list.findIndex(item => item.id === active.id);
  const newIndex = list.findIndex(item => item.id === over.id);
  if (oldIndex === -1 || newIndex === -1) return;
  persist(arrayMove(list, oldIndex, newIndex));
}
