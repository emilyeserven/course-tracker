import type { LinkProps } from "@tanstack/react-router";

import { Fragment } from "react";

import { Link, useLocation } from "@tanstack/react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Crumb {
  label: string;
  to?: LinkProps["to"];
}

interface SegmentEntry {
  section?: { label: string;
    to: LinkProps["to"]; };
  label: string;
  to: LinkProps["to"];
}

// Static map of the first path segment to its breadcrumb trail. Detail/edit
// pages reuse the parent segment's entry and append a leaf crumb.
const SEGMENT_MAP: Record<string, SegmentEntry> = {
  dashboard: {
    label: "Dashboard",
    to: "/dashboard",
  },
  onboard: {
    label: "Onboard",
    to: "/onboard",
  },
  settings: {
    label: "Settings",
    to: "/settings",
  },
  records: {
    label: "Records",
    to: "/records",
  },
  providers: {
    section: {
      label: "Records",
      to: "/records",
    },
    label: "Providers",
    to: "/providers",
  },
  resources: {
    section: {
      label: "Records",
      to: "/records",
    },
    label: "Resources",
    to: "/resources",
  },
  actions: {
    label: "Actions",
    to: "/actions",
  },
  routines: {
    section: {
      label: "Actions",
      to: "/actions",
    },
    label: "Routines",
    to: "/routines",
  },
  tasks: {
    section: {
      label: "Actions",
      to: "/actions",
    },
    label: "Task Lists",
    to: "/tasks",
  },
  dailies: {
    section: {
      label: "Actions",
      to: "/actions",
    },
    label: "Dailies",
    to: "/dailies",
  },
};

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return [
      {
        label: "Dashboard",
      },
    ];
  }

  const entry = SEGMENT_MAP[segments[0]];
  if (!entry) {
    return [
      {
        label: segments[0],
      },
    ];
  }

  const crumbs: Crumb[] = [];
  if (entry.section) {
    crumbs.push({
      label: entry.section.label,
      to: entry.section.to,
    });
  }
  crumbs.push({
    label: entry.label,
    to: entry.to,
  });

  if (segments.length > 1) {
    const last = segments[segments.length - 1];
    crumbs.push({
      label: last === "edit" ? "Edit" : "Detail",
    });
  }

  return crumbs;
}

/** Static breadcrumb derived from the current pathname (see `SEGMENT_MAP`). */
export function AppBreadcrumb() {
  const {
    pathname,
  } = useLocation();
  const crumbs = buildCrumbs(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !crumb.to
                  ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )
                  : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.to}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
