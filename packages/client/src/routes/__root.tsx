import type { QuickAddKey } from "@/components/dialogs/quickAdd";

import React, { useState } from "react";

import { createRootRoute, Outlet } from "@tanstack/react-router";

import { QuickAddDialogs } from "@/components/dialogs/quickAdd";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppBreadcrumb, AppSidebar } from "@/components/layout/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { PageActionsProvider } from "@/context/PageActionsProvider";
import { usePageActionsSlot } from "@/hooks/usePageActionsSlot";

const RootLayout: React.FunctionComponent = () => {
  const [activeQuickAdd, setActiveQuickAdd] = useState<QuickAddKey | null>(null);
  const {
    setNode,
  } = usePageActionsSlot();

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
          <div
            ref={setNode}
            className="ml-auto flex items-center gap-2"
          />
        </header>
        <PageContainer className="mb-8 flex flex-col py-4">
          <Outlet />
        </PageContainer>
      </SidebarInset>
      <QuickAddDialogs
        active={activeQuickAdd}
        onClose={() => setActiveQuickAdd(null)}
      />
      <Toaster />
    </SidebarProvider>
  );
};

const RootComponent: React.FunctionComponent = () => (
  <PageActionsProvider>
    <RootLayout />
  </PageActionsProvider>
);

export const Route = createRootRoute({
  component: RootComponent,
});
