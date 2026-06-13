import type { ReactNode } from "react";

import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";

/**
 * Wraps `children` in a minimal in-memory TanStack Router so components that
 * render `<Link>` can be exercised in isolation (tests and Storybook). It only
 * provides router context — it does not match the app's real route tree, so
 * navigation is a no-op; assert on rendered output and handlers, not routing.
 */
export function RouterStub({
  children,
}: { children: ReactNode }) {
  const rootRoute = createRootRoute({
    component: () => <>{children}</>,
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({
      initialEntries: ["/"],
    }),
  });
  // The stub router's tree is intentionally narrower than the registered app
  // tree that types `<Link to>`, so the instance type won't line up — that's
  // fine for a context-only provider.
  return <RouterProvider router={router as never} />;
}
