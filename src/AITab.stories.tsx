import type { Meta, StoryObj } from '@storybook/react';
import AITab from './AITab';
import { lowRisk, mediumRisk, highRisk } from './mock/ai.mock';

const meta: Meta<typeof AITab> = {
  title: 'AITab',
  component: AITab,
};
export default meta;

export const Low: StoryObj<typeof AITab> = {
  args: { lastSnapshot: lowRisk },
};
export const Medium: StoryObj<typeof AITab> = {
  args: { lastSnapshot: mediumRisk },
};
export const High: StoryObj<typeof AITab> = {
  args: { lastSnapshot: highRisk },
};
