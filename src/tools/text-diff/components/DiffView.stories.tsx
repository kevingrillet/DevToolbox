import type { Meta, StoryObj } from '@storybook/react-vite';
import { DiffView } from './DiffView';
import { computeDiff } from '../lib/diff';

/**
 * `DiffView` est purement présentationnel : il consomme un `DiffOp[]` (produit par
 * la couche pure `lib/diff`) et le rend en vue unifiée ou côte-à-côte. On génère
 * ici des opérations réalistes avec `computeDiff` pour illustrer les deux vues.
 */
const before = 'const a = 1;\nconst b = 2;\nconsole.log(a + b);\nreturn a;';
const after = 'const a = 1;\nconst b = 3;\nconsole.log(a * b);\nreturn a;\nreturn b;';
const ops = computeDiff(before, after, 'line', { ignoreCase: false, ignoreWhitespace: false });
const wordOps = computeDiff('the quick brown fox', 'the slow brown cat', 'word', {
  ignoreCase: false,
  ignoreWhitespace: false,
});

const meta: Meta<typeof DiffView> = {
  title: 'Tools/Text Diff/DiffView',
  component: DiffView,
  args: { ops, beforeLabel: 'Avant', afterLabel: 'Après' },
};
export default meta;

type Story = StoryObj<typeof DiffView>;

export const Unified: Story = { args: { view: 'unified' } };

export const SideBySide: Story = { args: { view: 'split' } };

export const WordGranularity: Story = { args: { view: 'unified', ops: wordOps } };
