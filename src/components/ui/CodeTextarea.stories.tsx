import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { CodeTextarea, type CodeTextareaProps } from './CodeTextarea';

const meta: Meta<typeof CodeTextarea> = {
  title: 'UI/CodeTextarea',
  component: CodeTextarea,
  args: {
    label: 'Code',
    language: 'python',
    rows: 6,
    value: '# Exemple\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n',
  },
};
export default meta;
type Story = StoryObj<typeof CodeTextarea>;

function EditableCode(props: CodeTextareaProps) {
  const [value, setValue] = useState(props.value);
  return (
    <CodeTextarea {...props} value={value} onChange={(event) => setValue(event.target.value)} />
  );
}

export const Editable: Story = { render: (args) => <EditableCode {...args} /> };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Error: Story = { args: { readOnly: true, error: 'Erreur à la ligne 2.' } };
