import type { LucideIcon } from "lucide-react";

import {
  BookOpenIcon,
  CircleCheckIcon,
  ListTodoIcon,
  RepeatIcon,
} from "lucide-react";

export type QuickAddKey = "readwise" | "todoist" | "routine" | "task";

export type QuickAddGroup = "external" | "tracker";

export interface QuickAddOption {
  key: QuickAddKey;
  label: string;
  icon: LucideIcon;
  group: QuickAddGroup;
}

// Single source of truth for the Quick Add entries so the desktop dropdown and
// the mobile hamburger menu stay in sync.
export const QUICK_ADD_OPTIONS: QuickAddOption[] = [
  {
    key: "readwise",
    label: "Readwise",
    icon: BookOpenIcon,
    group: "external",
  },
  {
    key: "todoist",
    label: "Todoist",
    icon: ListTodoIcon,
    group: "external",
  },
  {
    key: "routine",
    label: "Routine",
    icon: RepeatIcon,
    group: "tracker",
  },
  {
    key: "task",
    label: "Task",
    icon: CircleCheckIcon,
    group: "tracker",
  },
];
