/**
 * Assemblage des `DiffOp` en **lignes** d'affichage pour le `DiffView`. Découplé
 * du composant pour rester testable et ne pas mélanger logique et rendu.
 */
import type { DiffOp, DiffOpType } from '../lib/diff';

export interface RowSeg {
  type: DiffOpType;
  text: string;
}

export interface DiffRow {
  segs: RowSeg[];
  /** La ligne existe côté source (contenu equal ou delete). */
  hasLeft: boolean;
  /** La ligne existe côté résultat (contenu equal ou insert). */
  hasRight: boolean;
  /** Numéro de ligne source (1-based), si `hasLeft`. */
  leftNo?: number;
  /** Numéro de ligne résultat (1-based), si `hasRight`. */
  rightNo?: number;
}

/**
 * Redécoupe les `DiffOp` (dont la `value` peut couvrir plusieurs lignes) en lignes
 * d'affichage, puis numérote indépendamment les côtés source / résultat.
 */
export function buildRows(ops: DiffOp[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let segs: RowSeg[] = [];
  let hasLeft = false;
  let hasRight = false;

  const flush = () => {
    rows.push({ segs, hasLeft, hasRight });
    segs = [];
    hasLeft = false;
    hasRight = false;
  };

  for (const op of ops) {
    const onLeft = op.type === 'equal' || op.type === 'delete';
    const onRight = op.type === 'equal' || op.type === 'insert';
    const parts = op.value.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] !== '') segs.push({ type: op.type, text: parts[i] });
      // Tout segment non terminal est suivi d'un saut de ligne : on clôt la ligne.
      if (i < parts.length - 1) {
        if (onLeft) hasLeft = true;
        if (onRight) hasRight = true;
        flush();
      } else if (parts[i] !== '') {
        if (onLeft) hasLeft = true;
        if (onRight) hasRight = true;
      }
    }
  }
  // Dernière ligne sans saut de ligne final.
  if (segs.length > 0 || hasLeft || hasRight) flush();

  let leftNo = 0;
  let rightNo = 0;
  for (const row of rows) {
    if (row.hasLeft) row.leftNo = ++leftNo;
    if (row.hasRight) row.rightNo = ++rightNo;
  }
  return rows;
}
