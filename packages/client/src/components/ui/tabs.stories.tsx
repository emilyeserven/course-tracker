import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

function TabsDemo() {
  return (
    <Tabs
      defaultValue="account"
      className="w-80"
    >
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings</TabsContent>
      <TabsContent value="password">Password settings</TabsContent>
    </Tabs>
  );
}

const meta = {
  component: TabsDemo,
} satisfies Meta<typeof TabsDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Inactive tab content is unmounted until its trigger is selected.
export const SwitchTab: Story = {};
