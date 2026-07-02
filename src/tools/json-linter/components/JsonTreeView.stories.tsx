import type { Meta, StoryObj } from '@storybook/react-vite';
import { JsonTreeView } from './JsonTreeView';
import { buildTree } from '../lib/tree';
import { parseJson } from '../lib/parse';
import { I18nProvider } from '../../../i18n/I18nProvider';

/**
 * `JsonTreeView` rend récursivement un arbre JSON typé (issu de `lib/tree`). Il
 * consomme le contexte i18n (libellés de types) : on l'enveloppe donc dans
 * `<I18nProvider>`. Les stories fournissent des callbacks inertes et un `isOpen`
 * qui déplie tout, pour montrer la structure complète.
 */
const parsed = parseJson(
  '{"user":{"name":"Ada","roles":["admin","dev"],"active":true},"count":42,"meta":null}',
);
const tree = parsed.ok ? buildTree(parsed.value) : buildTree(null);

const meta: Meta<typeof JsonTreeView> = {
  title: 'Tools/JSON Linter/JsonTreeView',
  component: JsonTreeView,
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
  args: {
    node: tree,
    isOpen: () => true,
    onToggle: () => {},
    onSelect: () => {},
    matchSet: new Set<string>(),
    selected: null,
  },
};
export default meta;

type Story = StoryObj<typeof JsonTreeView>;

export const Expanded: Story = {};

export const WithSelectionAndMatches: Story = {
  args: {
    selected: '$.user.name',
    matchSet: new Set(['$.user.roles[0]', '$.count']),
  },
};
