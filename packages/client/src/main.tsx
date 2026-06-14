import { StrictMode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

import { routeTree } from "./routeTree.gen.ts";

import { STORAGE_KEYS } from "@/constants/storageKeys";
import { ThemeProvider } from "@/context/ThemeProvider.tsx";

const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          defaultTheme="light"
          storageKey={STORAGE_KEYS.theme}
        >
          <RouterProvider
            router={router}
            context={queryClient}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
