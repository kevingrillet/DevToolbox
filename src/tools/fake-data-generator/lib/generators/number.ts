/**
 * Générateur de nombres aléatoires dans un intervalle `[min, max]`, entiers ou à
 * décimales fixes. Déterministe via le `rng` injecté. Si `min > max`, les bornes
 * sont interverties (tolérant à la saisie).
 */
import { readNumber, type FakerContext, type FakerGenerator } from '../types';

export const numberGenerator: FakerGenerator = {
  id: 'number',
  labelKey: 'tools.faker.generators.number',
  fields: [
    {
      kind: 'number',
      key: 'count',
      labelKey: 'tools.faker.fields.count',
      min: 1,
      max: 100,
      default: 5,
    },
    {
      kind: 'number',
      key: 'min',
      labelKey: 'tools.faker.fields.min',
      min: -1000000,
      max: 1000000,
      default: 0,
    },
    {
      kind: 'number',
      key: 'max',
      labelKey: 'tools.faker.fields.max',
      min: -1000000,
      max: 1000000,
      default: 100,
    },
    {
      kind: 'number',
      key: 'decimals',
      labelKey: 'tools.faker.fields.decimals',
      min: 0,
      max: 6,
      default: 0,
    },
  ],
  generate(options, ctx: FakerContext): string {
    const count = Math.max(0, Math.floor(readNumber(options, 'count', 5)));
    let lo = readNumber(options, 'min', 0);
    let hi = readNumber(options, 'max', 100);
    if (lo > hi) [lo, hi] = [hi, lo];
    const decimals = Math.min(6, Math.max(0, Math.floor(readNumber(options, 'decimals', 0))));

    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      if (decimals > 0) {
        // Décimales : intervalle fermé [lo, hi] — on échelonne sur le pas le plus
        // fin représentable (10^-decimals) pour que la borne max soit atteignable.
        const steps = Math.round((hi - lo) * 10 ** decimals);
        const value = lo + Math.floor(ctx.rng() * (steps + 1)) / 10 ** decimals;
        list.push(value.toFixed(decimals));
      } else {
        // Entiers : tirage uniforme sur les entiers de [lo, hi] sans biais des
        // bornes (le `Math.round` sous-représentait lo/hi de moitié). Bornes non
        // entières resserrées vers l'intérieur (ceil/floor).
        const ilo = Math.ceil(lo);
        const ihi = Math.floor(hi);
        const value =
          ihi >= ilo
            ? ilo + Math.floor(ctx.rng() * (ihi - ilo + 1))
            : Math.round(lo + ctx.rng() * (hi - lo));
        list.push(String(value));
      }
    }
    return list.join('\n');
  },
};
