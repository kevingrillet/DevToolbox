/**
 * Générateur d'UUID v4 (RFC 4122), déterministe via le `rng` injecté.
 *
 * On n'utilise pas `crypto.randomUUID` : on a besoin de pouvoir reproduire la
 * sortie à partir d'une graine. Les bits de version (4) et de variante (10xx) sont
 * forcés conformément à la norme.
 */
import { readBoolean, readNumber, type FakerContext, type FakerGenerator } from '../types';

function uuidV4(rng: () => number): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(rng() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante 10xx
  const hex: string[] = [];
  for (let i = 0; i < 16; i++) hex.push(bytes[i].toString(16).padStart(2, '0'));
  return (
    `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-` +
    `${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`
  );
}

export const uuidGenerator: FakerGenerator = {
  id: 'uuid',
  labelKey: 'tools.faker.generators.uuid',
  fields: [
    {
      kind: 'number',
      key: 'count',
      labelKey: 'tools.faker.fields.count',
      min: 1,
      max: 100,
      default: 5,
    },
    { kind: 'boolean', key: 'hyphens', labelKey: 'tools.faker.fields.hyphens', default: true },
    { kind: 'boolean', key: 'uppercase', labelKey: 'tools.faker.fields.uppercase', default: false },
  ],
  generate(options, ctx: FakerContext): string {
    const count = Math.max(0, Math.floor(readNumber(options, 'count', 5)));
    const hyphens = readBoolean(options, 'hyphens', true);
    const uppercase = readBoolean(options, 'uppercase', false);

    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = uuidV4(ctx.rng);
      if (!hyphens) id = id.replace(/-/g, '');
      if (uppercase) id = id.toUpperCase();
      list.push(id);
    }
    return list.join('\n');
  },
};
