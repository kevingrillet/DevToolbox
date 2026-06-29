/**
 * Générateur de nombres pseudo-aléatoires *déterministe* à partir d'une graine.
 *
 * Pas besoin de qualité cryptographique ici (données factices) : `mulberry32` est
 * rapide, compact et reproductible. Une même graine produit toujours la même
 * suite — c'est ce qui permet la génération déterministe optionnelle de l'outil.
 */

/** Hache une chaîne en entier 32 bits non signé (FNV-1a). */
export function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** PRNG mulberry32 : renvoie une fonction produisant des flottants dans [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Construit un RNG à partir d'une graine textuelle. La graine est toujours
 * non vide ici (le store fournit une graine auto quand l'utilisateur n'en saisit
 * pas), garantissant un rendu stable entre deux re-rendus.
 */
export function createRng(seed: string): () => number {
  return mulberry32(hashSeed(seed));
}
