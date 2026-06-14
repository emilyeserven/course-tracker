import type { Tag } from "@emstack/types";

import { PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TagDisplayRowProps {
  tag: Tag;
  isAnyEditing: boolean;
  onEdit: () => void;
}

export function TagDisplayRow({
  tag,
  isAnyEditing,
  onEdit,
}: TagDisplayRowProps) {
  return (
    <li className="flex items-center justify-between gap-2 px-2 py-1.5">
      <span className="text-sm">{tag.name}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={onEdit}
        disabled={isAnyEditing}
      >
        <PencilIcon className="size-3.5" />
      </Button>
    </li>
  );
}
