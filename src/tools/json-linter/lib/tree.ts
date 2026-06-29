/**
 * Construit un arbre typé navigable à partir d'une valeur JSON. Chaque nœud porte
 * son chemin (style JSONPath), son type, sa valeur brute (pour copie) et ses
 * enfants. `flatten` parcourt l'arbre en profondeur (pour la recherche).
 */
import type { JsonValue } from './parse';

export type JsonType = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object';

export interface TreeNode {
  /** Chemin unique (JSONPath), ex. `$.users[0].name`. Sert aussi d'identifiant. */
  path: string;
  /** Clé d'affichage : nom de propriété, index de tableau, ou '' pour la racine. */
  keyLabel: string;
  type: JsonType;
  /** Valeur d'origine (utile pour copier le sous-arbre). */
  raw: JsonValue;
  primitive: boolean;
  children: TreeNode[];
}

export function jsonTypeOf(value: JsonValue): JsonType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  const t = typeof value;
  if (t === 'object') return 'object';
  return t as 'string' | 'number' | 'boolean';
}

/** Construit le chemin enfant à partir du chemin parent et d'une clé/index. */
export function childPath(parent: string, key: string | number): string {
  if (typeof key === 'number') return `${parent}[${key}]`;
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`;
}

export function buildTree(value: JsonValue, keyLabel = '', path = '$'): TreeNode {
  const type = jsonTypeOf(value);
  const node: TreeNode = {
    path,
    keyLabel,
    type,
    raw: value,
    primitive: type !== 'array' && type !== 'object',
    children: [],
  };
  if (type === 'array') {
    node.children = (value as JsonValue[]).map((item, index) =>
      buildTree(item, String(index), childPath(path, index)),
    );
  } else if (type === 'object') {
    node.children = Object.entries(value as { [k: string]: JsonValue }).map(([key, item]) =>
      buildTree(item, key, childPath(path, key)),
    );
  }
  return node;
}

export function flatten(node: TreeNode): TreeNode[] {
  const out: TreeNode[] = [node];
  for (const child of node.children) out.push(...flatten(child));
  return out;
}
