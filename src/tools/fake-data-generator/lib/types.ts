/**
 * Contrats du générateur de données factices (pattern Strategy + Registry).
 *
 * Chaque générateur déclare ses **champs d'options** (`FakerField`) : l'UI les rend
 * génériquement (nombre / booléen / liste). Ajouter un générateur = ajouter un
 * plugin (champs + `generate`) au registre, **sans toucher à l'UI**.
 *
 * `generate` reçoit un `rng` injecté (issu du store) plutôt que de tirer son
 * aléatoire lui-même : la logique reste pure et testable de façon déterministe.
 */

export interface FakerContext {
  /** Source d'aléatoire dans [0, 1). Déterministe si une graine est fixée. */
  rng: () => number;
}

export type FakerField =
  | { kind: 'number'; key: string; labelKey: string; min: number; max: number; default: number }
  | { kind: 'boolean'; key: string; labelKey: string; default: boolean }
  | {
      kind: 'select';
      key: string;
      labelKey: string;
      options: { value: string; labelKey: string }[];
      default: string;
    };

export type FakerOptions = Record<string, string | number | boolean>;

export interface FakerGenerator {
  id: string;
  labelKey: string;
  fields: FakerField[];
  generate(options: FakerOptions, ctx: FakerContext): string;
}

/** Options par défaut d'un générateur, dérivées de ses champs. */
export function defaultOptions(generator: FakerGenerator): FakerOptions {
  const options: FakerOptions = {};
  for (const field of generator.fields) options[field.key] = field.default;
  return options;
}

export function readNumber(options: FakerOptions, key: string, fallback: number): number {
  const value = options[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function readBoolean(options: FakerOptions, key: string, fallback: boolean): boolean {
  const value = options[key];
  return typeof value === 'boolean' ? value : fallback;
}

export function readString(options: FakerOptions, key: string, fallback: string): string {
  const value = options[key];
  return typeof value === 'string' ? value : fallback;
}
