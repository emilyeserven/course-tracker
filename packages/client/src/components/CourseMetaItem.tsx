import type { IconName } from "lucide-react/dynamic";

import { DynamicIcon } from "lucide-react/dynamic";

interface CourseMetaItemProps {
  value?: string | number;
  condition?: boolean;
  icon?: IconName;
  emptyText?: string;
}

export function CourseMetaItem({
  value,
  condition,
  icon,
  emptyText,
}: CourseMetaItemProps) {
  if (!condition) {
    return <></>;
  }
  return (
    <div className="flex flex-row items-center gap-1">
      {icon && (
        <DynamicIcon
          name={icon}
          size={16}
        />
      )}
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
