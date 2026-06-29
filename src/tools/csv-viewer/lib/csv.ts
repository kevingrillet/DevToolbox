/**
 * Parseur CSV maison (machine à états) gérant les guillemets, les guillemets
 * échappés (`""`), et les délimiteurs / sauts de ligne à l'intérieur des champs
 * entre guillemets. Détection simple du délimiteur (`,` `;` tab).
 */
export interface CsvTable {
  headers: string[];
  rows: string[][];
  columnCount: number;
}

/**
 * Devine le délimiteur d'après le 1er enregistrement (`,` par défaut). Le comptage
 * ignore les délimiteurs situés DANS un champ entre guillemets (sinon `"a;b",c`
 * fausserait la détection) et s'arrête au premier saut de ligne hors guillemets.
 */
export function detectDelimiter(text: string): string {
  const candidates = [',', ';', '\t'];
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0 };
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"')
          i++; // guillemet échappé
        else inQuotes = false;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === '\n' || ch === '\r')
      break; // fin du 1er enregistrement
    else if (ch in counts) counts[ch]++;
  }
  let best = ',';
  let bestCount = -1;
  for (const d of candidates) {
    if (counts[d] > bestCount) {
      bestCount = counts[d];
      best = d;
    }
  }
  return best;
}

/** Découpe un CSV en matrice de cellules. */
export function parseCsv(text: string, delimiter = ','): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  // L'enregistrement courant a-t-il « commencé » ? Vrai dès qu'un caractère lui
  // appartient — y compris un guillemet ouvrant. Permet de distinguer un champ
  // vide entre guillemets (`""` → ligne `['']`) d'un simple saut de ligne final.
  let started = false;
  let i = 0;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
    started = false;
  };

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"' && field === '') {
      // Un guillemet n'ouvre un champ quoté qu'en DÉBUT de champ. Ailleurs
      // (`a"b`) il est littéral, conformément au comportement attendu d'un CSV.
      inQuotes = true;
      started = true;
      i++;
    } else if (ch === delimiter) {
      pushField();
      started = true;
      i++;
    } else if (ch === '\n') {
      // Ligne entièrement vide → ignorée (pas de ligne fantôme `['']`). Un champ
      // vide quoté (`""`) a `started = true` et est donc bien conservé.
      if (started || field !== '' || row.length > 0) pushRow();
      i++;
    } else if (ch === '\r') {
      if (started || field !== '' || row.length > 0) pushRow();
      i += text[i + 1] === '\n' ? 2 : 1;
    } else {
      field += ch;
      started = true;
      i++;
    }
  }

  if (started || field !== '' || row.length > 0) pushRow();
  return rows;
}

/** Construit une table normalisée (lignes de longueur égale), avec ou sans en-tête. */
export function toTable(text: string, delimiter: string, hasHeader: boolean): CsvTable {
  const matrix = parseCsv(text, delimiter);
  const columnCount = matrix.reduce((max, r) => Math.max(max, r.length), 0);
  const normalized = matrix.map((r) => {
    const cells = r.slice();
    while (cells.length < columnCount) cells.push('');
    return cells;
  });

  if (hasHeader && normalized.length > 0) {
    return { headers: normalized[0], rows: normalized.slice(1), columnCount };
  }
  const headers = Array.from({ length: columnCount }, (_, i) => `#${i + 1}`);
  return { headers, rows: normalized, columnCount };
}
