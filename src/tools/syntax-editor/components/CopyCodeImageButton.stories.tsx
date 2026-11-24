import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';
import { CodeTextarea } from '../../../components/ui/CodeTextarea';
import { I18nProvider } from '../../../i18n/I18nProvider';
import { DEFAULT_CUSTOM_PALETTE } from '../lib/themes';
import { CopyCodeImageButton } from './CopyCodeImageButton';

const source = 'const greeting = "Bonjour";\nconsole.log(greeting);';

function Example({ empty = false }: { empty?: boolean }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const value = empty ? '' : source;
  return (
    <div className="flex flex-col items-start gap-3">
      <CopyCodeImageButton source={value} editorRef={editorRef} />
      <CodeTextarea
        label="Code"
        editorRef={editorRef}
        value={value}
        language="javascript"
        palette={DEFAULT_CUSTOM_PALETTE}
        rows={3}
        readOnly
      />
    </div>
  );
}

const meta: Meta<typeof Example> = {
  title: 'Tools/Prism/CopyCodeImageButton',
  component: Example,
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Example>;

export const Default: Story = {};
export const Empty: Story = { args: { empty: true } };
