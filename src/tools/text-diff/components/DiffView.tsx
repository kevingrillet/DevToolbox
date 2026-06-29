/**
 * Affichage du diff, alimenté par un `DiffOp[]` unique quelle que soit la
 * granularité. Deux vues :
 *  - unifiée : un seul flux, ajouts surlignés en vert, suppressions en rouge barré ;
 *  - côte-à-côte : à gauche equal+suppressions, à droite equal+ajouts.
 *
 * Les surlignages utilisent `color-mix` sur les tokens de thème (`--color-success`
 * / `--color-danger`) : teinte translucide lisible dans les 8 combinaisons.
 */
import type { CSSProperties } from 'react';
import type { DiffOp, DiffOpType } from '../lib/diff';

function opStyle(type: DiffOpType): CSSProperties | undefined {
  if (type === 'insert') {
    return { backgroundColor: 'color-mix(in srgb, var(--color-success) 22%, transparent)' };
  }
  if (type === 'delete') {
    return { backgroundColor: 'color-mix(in srgb, var(--color-danger) 22%, transparent)' };
  }
  return undefined;
}

function Span({ op }: { op: DiffOp }) {
  if (op.type === 'equal') return <span>{op.value}</span>;
  return (
    <span className={op.type === 'delete' ? 'line-through' : undefined} style={opStyle(op.type)}>
      {op.value}
    </span>
  );
}

const PRE =
  'min-h-24 overflow-auto whitespace-pre-wrap break-words rounded-card border bg-surface p-4 font-mono text-sm text-fg';

export function DiffView({ ops, view }: { ops: DiffOp[]; view: 'split' | 'unified' }) {
  if (view === 'unified') {
    return (
      <pre className={PRE}>
        {ops.map((op, i) => (
          <Span key={i} op={op} />
        ))}
      </pre>
    );
  }

  const leftOps = ops.filter((op) => op.type !== 'insert');
  const rightOps = ops.filter((op) => op.type !== 'delete');
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <pre className={PRE}>
        {leftOps.map((op, i) => (
          <Span key={i} op={op} />
        ))}
      </pre>
      <pre className={PRE}>
        {rightOps.map((op, i) => (
          <Span key={i} op={op} />
        ))}
      </pre>
    </div>
  );
}
