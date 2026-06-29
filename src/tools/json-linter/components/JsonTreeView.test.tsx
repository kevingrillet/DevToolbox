import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JsonTreeView } from './JsonTreeView';
import { parseJson } from '../lib/parse';
import { buildTree, type TreeNode } from '../lib/tree';

function makeTree(src: string): TreeNode {
  const parsed = parseJson(src);
  if (!parsed.ok) throw new Error('fixture JSON invalide');
  return buildTree(parsed.value);
}

describe('JsonTreeView', () => {
  it('rend les nœuds et déclenche toggle/select', async () => {
    const tree = makeTree('{"a":1,"b":[2,3]}');
    const onToggle = vi.fn();
    const onSelect = vi.fn();
    render(
      <JsonTreeView
        node={tree}
        isOpen={() => true}
        onToggle={onToggle}
        onSelect={onSelect}
        matchSet={new Set()}
        selected={null}
      />,
    );
    // La clé "a" est rendue.
    expect(screen.getByText(/a:/)).toBeInTheDocument();

    // Le bouton de pliage du conteneur racine.
    const toggles = screen.getAllByRole('button', { expanded: true });
    await userEvent.click(toggles[0]);
    expect(onToggle).toHaveBeenCalled();
  });

  it('surligne les correspondances et le nœud sélectionné', () => {
    const tree = makeTree('{"a":1}');
    const { container } = render(
      <JsonTreeView
        node={tree}
        isOpen={() => true}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
        matchSet={new Set(['$.a'])}
        selected="$"
      />,
    );
    expect(container.querySelector('.bg-accent-soft')).not.toBeNull();
    expect(container.querySelector('.outline-accent-strong')).not.toBeNull();
  });
});
