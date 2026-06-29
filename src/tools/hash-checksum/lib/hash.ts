/**
 * Registre des algorithmes de hachage et calcul (pattern Strategy + Registry).
 *
 * SHA-1/256/512 sont délégués à `SubtleCrypto` (natif, rapide, sûr) ; MD5 est
 * calculé par notre implémentation maison (`md5.ts`), absent de SubtleCrypto.
 * Tout retourne une chaîne hexadécimale minuscule.
 *
 * Ajouter un algorithme = ajouter une entrée à `ALGORITHMS` + un cas dans
 * `hashBytes` (pour un nouvel algorithme maison) ou son nom SubtleCrypto.
 */
import { md5Hex, toHex } from './md5';

export interface HashAlgorithm {
  id: string;
  label: string;
}

export const ALGORITHMS: HashAlgorithm[] = [
  { id: 'md5', label: 'MD5' },
  { id: 'sha-1', label: 'SHA-1' },
  { id: 'sha-256', label: 'SHA-256' },
  { id: 'sha-512', label: 'SHA-512' },
];

/** Correspondance id interne → nom d'algorithme SubtleCrypto. */
const SUBTLE_NAME: Record<string, string> = {
  'sha-1': 'SHA-1',
  'sha-256': 'SHA-256',
  'sha-512': 'SHA-512',
};

/** Calcule le hash hexadécimal d'octets pour un algorithme donné. */
export async function hashBytes(algoId: string, bytes: Uint8Array): Promise<string> {
  if (algoId === 'md5') return md5Hex(bytes);
  const name = SUBTLE_NAME[algoId];
  if (!name) throw new Error(`Algorithme de hachage inconnu : ${algoId}`);
  // `new Uint8Array(bytes)` garantit un tampon ArrayBuffer (et non SharedArrayBuffer),
  // requis par le typage de `BufferSource` de SubtleCrypto.
  const digest = await crypto.subtle.digest(name, new Uint8Array(bytes));
  return toHex(new Uint8Array(digest));
}

export interface HashResult {
  id: string;
  label: string;
  hex: string;
}

/** Calcule tous les algorithmes en parallèle pour le même message. */
export async function hashAll(bytes: Uint8Array): Promise<HashResult[]> {
  return Promise.all(
    ALGORITHMS.map(async (algo) => ({
      id: algo.id,
      label: algo.label,
      hex: await hashBytes(algo.id, bytes),
    })),
  );
}
