import type { Meta, StoryObj } from '@storybook/react-vite';

import { OnboardingInput } from './OnboardingInput';

const meta = {
  component: OnboardingInput,
} satisfies Meta<typeof OnboardingInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};