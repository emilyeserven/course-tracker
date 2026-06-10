import { useEffect, useRef } from "react";

import { useNavigate } from "@tanstack/react-router";

interface RedirectableDaily {
  id: string;
  taskId?: string | null;
  resource?: { id: string } | null;
  task?: { id: string } | null;
}

interface UseRedirectLinkedDailyOptions {
  daily: RedirectableDaily | undefined | null;
  mode: "view" | "edit";
}

/**
 * If a Daily has a linked Task or Resource, redirect to that parent page with
 * search params so the embedded Daily section auto-opens. Used by the
 * dedicated `/dailies/$id` and `/dailies/$id/edit` routes to surface linked
 * Dailies in their natural context.
 *
 * Returns `true` while a redirect has been scheduled / is in flight, so the
 * caller can render nothing.
 */
export function useRedirectLinkedDaily({
  daily,
  mode,
}: UseRedirectLinkedDailyOptions): boolean {
  const navigate = useNavigate();
  const firedRef = useRef(false);

  const taskId = daily?.taskId ?? daily?.task?.id ?? null;
  const resourceId = daily?.resource?.id ?? null;
  const shouldRedirect = !!(taskId || resourceId);

  useEffect(() => {
    if (!daily || !shouldRedirect || firedRef.current) {
      return;
    }
    firedRef.current = true;
    if (taskId) {
      void navigate({
        to: "/tasks/$id",
        params: {
          id: taskId,
        },
        search: {
          dailySection: daily.id,
          dailyMode: mode,
        },
        replace: true,
      });
    }
    else if (resourceId) {
      void navigate({
        to: "/resources/$id",
        params: {
          id: resourceId,
        },
        search: {
          dailySection: daily.id,
          dailyMode: mode,
        },
        replace: true,
      });
    }
  }, [daily, shouldRedirect, taskId, resourceId, mode, navigate]);

  return shouldRedirect;
}
