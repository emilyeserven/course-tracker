import type { ReactNode } from "react";

interface CourseMetaItemProps {
  value?: string | number | null;
  condition?: boolean;
  iconNode?: ReactNode;
  emptyText?: string;
}

export function CourseMetaItem({
  value,
  condition,
  iconNode,
  emptyText,
}: CourseMetaItemProps) {
  if (!condition) {
    return <></>;
  }
  return (
    <div className="flex flex-row items-center gap-1">
      {iconNode && iconNode}
      <span className="text-sm">
        {condition
          ? `${value}`
          : (
            <i
              className="italic"
            >{emptyText}
            </i>
          )}
      </span>
    </div>
  );
}
