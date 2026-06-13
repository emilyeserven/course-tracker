import type { LucideIcon } from "lucide-react";

import {
  BookOpenIcon,
  Building2Icon,
  CircleCheckIcon,
  LibraryIcon,
  ListTodoIcon,
  RepeatIcon,
} from "lucide-react";

export type QuickAddKey
  = | "readwise"
    | "todoist"
    | "resource"
    | "provider"
    | "routine"
    | "task";

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
    key: "resource",
    label: "Resource",
    icon: LibraryIcon,
    group: "tracker",
  },
  {
    key: "provider",
    label: "Provider",
    icon: Building2Icon,
    group: "tracker",
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
