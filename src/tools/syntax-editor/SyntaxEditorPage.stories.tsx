import type { Meta, StoryObj } from '@storybook/react-vite';
import { I18nProvider } from '../../i18n/I18nProvider';
import SyntaxEditorPage from './SyntaxEditorPage';

const meta: Meta<typeof SyntaxEditorPage> = {
  title: 'Tools/Prism/SyntaxEditorPage',
  component: SyntaxEditorPage,
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof SyntaxEditorPage>;

export const Default: Story = {};
