import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeBlock } from './CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'UI/CodeBlock',
  component: CodeBlock,
};
export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const Json: Story = {
  args: { language: 'json', value: '{\n  "enabled": true,\n  "count": 42\n}' },
};
