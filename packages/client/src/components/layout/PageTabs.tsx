import type { ReactNode } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export interface PageTab<T extends string = string> {
  value: T;
  label: string;
  content: ReactNode;
}

interface PageTabsProps<T extends string> {
  tabs: PageTab<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}

/**
 * Project tab layout: a vertical tab rail with larger trigger text. Each tab's
 * content is prefixed with the tab's title as an h2 at the top of the panel.
 */
export function PageTabs<T extends string>({
  tabs,
  value,
  onValueChange,
  className,
}: PageTabsProps<T>) {
  return (
    <Tabs
      orientation="vertical"
      value={value}
      onValueChange={next => onValueChange(next as T)}
      className={className}
    >
      <TabsList>
        {tabs.map(t => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="text-base"
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(t => (
        <TabsContent
          key={t.value}
          value={t.value}
          className="flex flex-col gap-4"
        >
          <h2 className="text-2xl">{t.label}</h2>
          {t.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
