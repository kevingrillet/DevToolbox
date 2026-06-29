/**
 * Tri des lignes par colonne. Détecte automatiquement si la colonne est numérique
 * (toutes les cellules non vides sont des nombres décimaux) pour trier
 * numériquement plutôt qu'alphabétiquement. Renvoie une copie (les données source
 * ne sont pas mutées). Les cellules vides sont reléguées en fin, quel que soit le
 * sens du tri.
 */
export type SortDir = 'asc' | 'desc';

/**
 * Analyse une cellule comme nombre décimal STANDARD, ou renvoie `null`. On rejette
 * volontairement ce que `Number()` accepterait par surprise dans un CSV : hexadécimal
 * (`0x10`), binaire/octal (`0b…`/`0o…`), `Infinity`, `NaN`, espaces seuls.
 */
function parseNumeric(v: string): number | null {
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isNumericColumn(rows: string[][], column: number): boolean {
  let hasValue = false;
  for (const row of rows) {
    const v = (row[column] ?? '').trim();
    if (v === '') continue;
    hasValue = true;
    if (parseNumeric(v) === null) return false;
  }
  return hasValue;
}

export function sortRows(rows: string[][], column: number, dir: SortDir): string[][] {
  const numeric = isNumericColumn(rows, column);
  return rows.slice().sort((a, b) => {
    const av = (a[column] ?? '').trim();
    const bv = (b[column] ?? '').trim();
    if (numeric) {
      const an = parseNumeric(av);
      const bn = parseNumeric(bv);
      // Cellules vides (ou non numériques) toujours en fin, peu importe le sens.
      if (an === null && bn === null) return 0;
      if (an === null) return 1;
      if (bn === null) return -1;
      const cmp = an - bn;
      return dir === 'asc' ? cmp : -cmp;
    }
    // Cellules vides toujours en fin (comme la branche numérique), peu importe le sens.
    if (av === '' && bv === '') return 0;
    if (av === '') return 1;
    if (bv === '') return -1;
    // Locale figée ('en') → ordre déterministe quel que soit l'environnement.
    const cmp = av.localeCompare(bv, 'en');
    return dir === 'asc' ? cmp : -cmp;
  });
}
