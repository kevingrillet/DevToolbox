import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiffView } from './DiffView';
import { buildRows } from './rows';
import type { DiffOp } from '../lib/diff';

const ops: DiffOp[] = [
  { type: 'equal', value: 'commun ' },
  { type: 'insert', value: 'ajout' },
  { type: 'delete', value: 'retrait' },
];

describe('buildRows', () => {
  it('numérote indépendamment les lignes source et résultat', () => {
    const rows = buildRows([
      { type: 'equal', value: 'a\n' },
      { type: 'delete', value: 'b\n' },
      { type: 'insert', value: 'c\n' },
    ]);
    expect(rows.map((r) => [r.leftNo, r.rightNo])).toEqual([
      [1, 1], // a : présent des deux côtés
      [2, undefined], // b : supprimé → numéro source seulement
      [undefined, 2], // c : ajouté → numéro résultat seulement
    ]);
  });

  it('gère une dernière ligne sans saut de ligne final', () => {
    const rows = buildRows([{ type: 'equal', value: 'x\ny' }]);
    expect(rows).toHaveLength(2);
    expect(rows[1].leftNo).toBe(2);
  });
});

describe('DiffView', () => {
  it('rend une vue unifiée avec ajouts, suppressions et numéros de ligne', () => {
    const { container } = render(
      <DiffView ops={ops} view="unified" beforeLabel="Avant" afterLabel="Après" />,
    );
    expect(screen.getByText('ajout')).toBeInTheDocument();
    expect(screen.getByText('retrait')).toBeInTheDocument();
    // Un seul flux : un seul conteneur racine.
    expect(container.querySelectorAll(':scope > div')).toHaveLength(1);
    // Gouttière de numéros présente.
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });

  it('rend une vue côte-à-côte (deux colonnes)', () => {
    const { container } = render(
      <DiffView ops={ops} view="split" beforeLabel="Avant" afterLabel="Après" />,
    );
    // Deux panneaux.
    expect(container.querySelectorAll(':scope > div > div')).toHaveLength(2);
    expect(screen.getByText('ajout')).toBeInTheDocument();
    expect(screen.getByText('retrait')).toBeInTheDocument();
  });
});
