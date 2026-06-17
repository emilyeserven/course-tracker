import type { QuickAddKey } from "@/components/dialogs/quickAdd";

import React, { useState } from "react";

import { createRootRoute, Outlet } from "@tanstack/react-router";

import { QuickAddDialogs } from "@/components/dialogs/quickAdd";
import { AppBreadcrumb, AppSidebar } from "@/components/layout/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

const RootComponent: React.FunctionComponent = () => {
  const [activeQuickAdd, setActiveQuickAdd] = useState<QuickAddKey | null>(null);

  return (
    <SidebarProvider>
      <AppSidebar onQuickAdd={setActiveQuickAdd} />
      <SidebarInset>
        <header
          className="flex h-12 shrink-0 items-center gap-2 border-b px-4"
        >
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4"
          />
          <AppBreadcrumb />
        </header>
        <div className="container mb-8 py-4">
          <Outlet />
        </div>
      </SidebarInset>
      <QuickAddDialogs
        active={activeQuickAdd}
        onClose={() => setActiveQuickAdd(null)}
      />
      <Toaster />
    </SidebarProvider>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
