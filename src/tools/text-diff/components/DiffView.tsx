/**
 * Affichage du diff, alimenté par un `DiffOp[]` unique quelle que soit la
 * granularité. Le flux d'opérations est d'abord redécoupé en **lignes** (rows)
 * pour afficher une gouttière de numéros de ligne (source à gauche, résultat à
 * droite, façon diff classique). Deux vues :
 *  - unifiée : un seul flux, ajouts surlignés en vert, suppressions en rouge barré ;
 *  - côte-à-côte : à gauche equal+suppressions, à droite equal+ajouts.
 *
 * Les surlignages utilisent `color-mix` sur les tokens de thème (`--color-success`
 * / `--color-danger`) : teinte translucide lisible dans les 8 combinaisons.
 */
import type { CSSProperties } from 'react';
import type { DiffOp, DiffOpType } from '../lib/diff';
import { buildRows, type DiffRow, type RowSeg } from './rows';

function rowStyle(row: DiffRow): CSSProperties | undefined {
  // Ligne purement supprimée / ajoutée → fond translucide sur toute la ligne.
  // Une ligne « mixte » (equal + changements, en granularité mot/caractère) reste
  // neutre : ses segments portent eux-mêmes la couleur.
  if (row.hasLeft && !row.hasRight) {
    return { backgroundColor: 'color-mix(in srgb, var(--color-danger) 14%, transparent)' };
  }
  if (row.hasRight && !row.hasLeft) {
    return { backgroundColor: 'color-mix(in srgb, var(--color-success) 14%, transparent)' };
  }
  return undefined;
}

function segStyle(type: DiffOpType): CSSProperties | undefined {
  if (type === 'insert') {
    return { backgroundColor: 'color-mix(in srgb, var(--color-success) 22%, transparent)' };
  }
  if (type === 'delete') {
    return { backgroundColor: 'color-mix(in srgb, var(--color-danger) 22%, transparent)' };
  }
  return undefined;
}

function Seg({ seg }: { seg: RowSeg }) {
  if (seg.type === 'equal') return <span>{seg.text}</span>;
  return (
    <span className={seg.type === 'delete' ? 'line-through' : undefined} style={segStyle(seg.type)}>
      {seg.text}
    </span>
  );
}

const GUTTER_W = 'w-12';
const GUTTER = `select-none border-r px-2 text-right text-xs text-fg-muted tabular-nums ${GUTTER_W}`;
const CONTENT = 'flex-1 whitespace-pre-wrap break-words px-3';
const CONTAINER = 'min-h-24 overflow-auto rounded-card border bg-surface font-mono text-sm text-fg';
// En-têtes de gouttière (Avant/Après). Collés en haut pour rester visibles au
// défilement. `bg-surface` pour ne pas laisser transparaître les lignes dessous.
const HEADER =
  'sticky top-0 z-10 flex border-b bg-surface text-[0.65rem] font-semibold uppercase tracking-wide text-fg-muted';
const HEADER_CELL = `${GUTTER_W} shrink-0 px-2 py-1 text-right`;

/** Une ligne du flux unifié : deux gouttières (source, résultat) + contenu. */
function UnifiedRow({ row, segs }: { row: DiffRow; segs: RowSeg[] }) {
  return (
    <div className="flex" style={rowStyle(row)}>
      <span aria-hidden="true" className={GUTTER}>
        {row.leftNo ?? ''}
      </span>
      <span aria-hidden="true" className={GUTTER}>
        {row.rightNo ?? ''}
      </span>
      <code className={CONTENT}>
        {segs.map((seg, i) => (
          <Seg key={i} seg={seg} />
        ))}
      </code>
    </div>
  );
}

/** Une ligne d'un panneau côte-à-côte : une gouttière + contenu filtré. */
function SideRow({ no, segs, style }: { no?: number; segs: RowSeg[]; style?: CSSProperties }) {
  return (
    <div className="flex" style={style}>
      <span aria-hidden="true" className={GUTTER}>
        {no ?? ''}
      </span>
      <code className={CONTENT}>
        {segs.map((seg, i) => (
          <Seg key={i} seg={seg} />
        ))}
      </code>
    </div>
  );
}

export function DiffView({
  ops,
  view,
  beforeLabel,
  afterLabel,
}: {
  ops: DiffOp[];
  view: 'split' | 'unified';
  beforeLabel: string;
  afterLabel: string;
}) {
  const rows = buildRows(ops);

  if (view === 'unified') {
    return (
      <div className={CONTAINER}>
        <div className={HEADER}>
          <span className={HEADER_CELL}>{beforeLabel}</span>
          <span className={HEADER_CELL}>{afterLabel}</span>
          <span className="flex-1" />
        </div>
        <div className="py-2">
          {rows.map((row, i) => (
            <UnifiedRow key={i} row={row} segs={row.segs} />
          ))}
        </div>
      </div>
    );
  }

  // Côte-à-côte : à gauche les lignes présentes côté source (equal + delete), à
  // droite celles présentes côté résultat (equal + insert), chacune numérotée.
  const leftRows = rows.filter((row) => row.hasLeft);
  const rightRows = rows.filter((row) => row.hasRight);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className={CONTAINER}>
        <div className={HEADER}>
          <span className={HEADER_CELL}>#</span>
          <span className="flex-1 px-3 py-1 text-left">{beforeLabel}</span>
        </div>
        <div className="py-2">
          {leftRows.map((row, i) => (
            <SideRow
              key={i}
              no={row.leftNo}
              segs={row.segs.filter((seg) => seg.type !== 'insert')}
              style={row.hasRight ? undefined : rowStyle(row)}
            />
          ))}
        </div>
      </div>
      <div className={CONTAINER}>
        <div className={HEADER}>
          <span className={HEADER_CELL}>#</span>
          <span className="flex-1 px-3 py-1 text-left">{afterLabel}</span>
        </div>
        <div className="py-2">
          {rightRows.map((row, i) => (
            <SideRow
              key={i}
              no={row.rightNo}
              segs={row.segs.filter((seg) => seg.type !== 'delete')}
              style={row.hasLeft ? undefined : rowStyle(row)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
