/**
 * Recherche dans l'arbre. Si la requête commence par `$`, elle est interprétée
 * comme un JSONPath (sélection ciblée) ; sinon comme une recherche textuelle
 * insensible à la casse sur les clés et les valeurs primitives. Renvoie les
 * chemins des nœuds correspondants, dans l'ordre du document.
 */
import { flatten, type TreeNode } from './tree';
import { evalJsonPath } from './jsonpath';
import type { JsonValue } from './parse';

export function searchTree(root: TreeNode, rawRoot: JsonValue, query: string): string[] {
  const q = query.trim();
  if (q === '') return [];

  if (q.startsWith('$')) {
    const path = evalJsonPath(rawRoot, q);
    return path ? [path] : [];
  }

  const needle = q.toLowerCase();
  return flatten(root)
    .filter((node) => {
      if (node.keyLabel.toLowerCase().includes(needle)) return true;
      return node.primitive && String(node.raw).toLowerCase().includes(needle);
    })
    .map((node) => node.path);
}
