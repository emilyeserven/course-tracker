import type { BookmarkLinkingValue } from "./bookmarkLinkingContext";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  BookmarkLinkingContext,

} from "./bookmarkLinkingContext";

import { fetchSettings } from "@/utils/api/settings";
import { queryKeys } from "@/utils/queryKeys";

// Fetches the app settings once and shares the bookmark click preference +
// resolved endpoint with every bookmark link via context, so the individual
// render sites don't each issue a settings query. Mount once at the app root
// (inside the QueryClientProvider).
export function BookmarkLinkingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data,
  } = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: fetchSettings,
  });

  const value = useMemo<BookmarkLinkingValue>(
    () => ({
      clickTarget: data?.bookmarkClickTarget ?? "page",
      apiUrl: data?.bookmarkApiUrlResolved ?? null,
    }),
    [data?.bookmarkClickTarget, data?.bookmarkApiUrlResolved],
  );

  return (
    <BookmarkLinkingContext.Provider value={value}>
      {children}
    </BookmarkLinkingContext.Provider>
  );
}
