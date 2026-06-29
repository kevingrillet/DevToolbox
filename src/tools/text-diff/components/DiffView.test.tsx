import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiffView } from './DiffView';
import type { DiffOp } from '../lib/diff';

const ops: DiffOp[] = [
  { type: 'equal', value: 'commun ' },
  { type: 'insert', value: 'ajout' },
  { type: 'delete', value: 'retrait' },
];

describe('DiffView', () => {
  it('rend une vue unifiée avec ajouts et suppressions', () => {
    const { container } = render(<DiffView ops={ops} view="unified" />);
    expect(screen.getByText('ajout')).toBeInTheDocument();
    expect(screen.getByText('retrait')).toBeInTheDocument();
    // Un seul flux : un <pre>.
    expect(container.querySelectorAll('pre')).toHaveLength(1);
  });

  it('rend une vue côte-à-côte (deux colonnes)', () => {
    const { container } = render(<DiffView ops={ops} view="split" />);
    expect(container.querySelectorAll('pre')).toHaveLength(2);
    // L'ajout n'apparaît qu'à droite, le retrait qu'à gauche.
    expect(screen.getByText('ajout')).toBeInTheDocument();
    expect(screen.getByText('retrait')).toBeInTheDocument();
  });
});
