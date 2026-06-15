import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Wraps dnd-kit's per-group sortable wiring: returns the node ref, the
 * transform/transition style for the group container, and the drag-handle props
 * to spread onto the header's grip button. Keeps the dnd-kit imports out of
 * ModuleGroupSection.
 */
export function useGroupSortable(id: string) {
  const {
    attributes, listeners, setNodeRef, transform, transition,
  } = useSortable({
    id,
  });

  return {
    setNodeRef,
    style: {
      transform: CSS.Transform.toString(transform),
      transition,
    },
    dragHandleProps: {
      ...attributes,
      ...listeners,
    },
  };
}
