import type { QuickAddKey } from "@/components/dialogs/quickAdd";
import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import {
  Building2Icon,
  CircleCheckIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  RepeatIcon,
  SparklesIcon,
  TagIcon,
} from "lucide-react";

import {
  fetchProviders,
  fetchResources,
  fetchRoutines,
  fetchTasks,
  fetchTopics,
} from "@/utils/api";
import { queryKeys } from "@/utils/queryKeys";

/** A single entity row shown under a collapsible category. */
export interface NavItem {
  id: string;
  name: string;
}

/**
 * A collapsible nav category that lazily loads its top items. `getDetailLink`
 * returns a fully-typed TanStack Router link for one item, so the renderer can
 * stay generic while keeping the strict `to`/`params` typing.
 */
export interface NavCategory {
  label: string;
  icon: LucideIcon;
  /** "See All" target — the category's list page. */
  listTo: LinkProps["to"];
  /** Quick Add entity key opened by the category's "+" button. */
  quickAddKey: QuickAddKey;
  /** Per-item detail link descriptor (e.g. `/providers/$id`). */
  getDetailLink: (id: string) => LinkProps;
  /** TanStack Query cache key for the category's list. */
  queryKey: readonly unknown[];
  /** Fetches the list and normalizes each row to `{ id, name }`. */
  load: () => Promise<NavItem[]>;
}

/** A top-level section grouping several categories (Records, Plans, Actions). */
export interface NavSection {
  label: string;
  categories: NavCategory[];
}

/** A standalone (non-collapsible) top-level link. */
export interface NavLink {
  label: string;
  to: LinkProps["to"];
  icon: LucideIcon;
}

export const STANDALONE_LINKS: NavLink[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboardIcon,
  },
];

/** Shown only when onboarding is incomplete (see `useShowOnboard`). */
export const ONBOARD_LINK: NavLink = {
  label: "Onboard",
  to: "/onboard",
  icon: SparklesIcon,
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Records",
    categories: [
      {
        label: "Providers",
        icon: Building2Icon,
        listTo: "/providers",
        quickAddKey: "provider",
        getDetailLink: id => ({
          to: "/providers/$id",
          params: {
            id,
          },
        }),
        queryKey: queryKeys.providers.list(),
        load: async () =>
          (await fetchProviders()).map(p => ({
            id: p.id,
            name: p.name,
          })),
      },
      {
        label: "Resources",
        icon: LibraryIcon,
        listTo: "/resources",
        quickAddKey: "resource",
        getDetailLink: id => ({
          to: "/resources/$id",
          params: {
            id,
          },
        }),
        queryKey: queryKeys.resources.list(),
        load: async () =>
          (await fetchResources()).map(r => ({
            id: r.id,
            name: r.name,
          })),
      },
      {
        label: "Topics",
        icon: TagIcon,
        listTo: "/topics",
        quickAddKey: "topic",
        getDetailLink: id => ({
          to: "/topics/$id",
          params: {
            id,
          },
        }),
        queryKey: queryKeys.topics.list(),
        load: async () =>
          (await fetchTopics()).map(t => ({
            id: t.id,
            name: t.name,
          })),
      },
    ],
  },
  {
    label: "Actions",
    categories: [
      {
        label: "Routines",
        icon: RepeatIcon,
        listTo: "/routines",
        quickAddKey: "routine",
        getDetailLink: id => ({
          to: "/routines/$id",
          params: {
            id,
          },
        }),
        queryKey: queryKeys.routines.list(),
        load: async () =>
          (await fetchRoutines()).map(r => ({
            id: r.id,
            name: r.name,
          })),
      },
      {
        label: "Task Lists",
        icon: CircleCheckIcon,
        listTo: "/tasks",
        quickAddKey: "task",
        getDetailLink: id => ({
          to: "/tasks/$id",
          params: {
            id,
          },
        }),
        queryKey: queryKeys.tasks.list(),
        load: async () =>
          (await fetchTasks()).map(t => ({
            id: t.id,
            name: t.name,
          })),
      },
    ],
  },
];

/** How many items to show under each category before "See All". */
export const NAV_CATEGORY_LIMIT = 5;
