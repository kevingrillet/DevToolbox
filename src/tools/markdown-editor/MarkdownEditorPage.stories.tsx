import type { Meta, StoryObj } from '@storybook/react-vite';
import MarkdownEditorPage from './MarkdownEditorPage';
import { I18nProvider } from '../../i18n/I18nProvider';

/**
 * Story de l'éditeur Markdown complet (éditeur + aperçu live sanitizé). Le composant
 * gère son propre état via `useMarkdownStore` et démarre sur un Markdown d'exemple
 * localisé ; on l'enveloppe dans `<I18nProvider>` pour les libellés et la langue.
 * Idéale pour vérifier le rendu de l'aperçu dans les 8 combinaisons de thème.
 */
const meta: Meta<typeof MarkdownEditorPage> = {
  title: 'Tools/Markdown/MarkdownEditorPage',
  component: MarkdownEditorPage,
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

type Story = StoryObj<typeof MarkdownEditorPage>;

export const Default: Story = {};
