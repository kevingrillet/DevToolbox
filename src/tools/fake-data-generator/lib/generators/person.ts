/**
 * Générateur d'identités factices localisées (en / fr) : nom complet, prénom, nom
 * de famille ou e-mail dérivé. Déterministe via le `rng` injecté. Les listes sont
 * volontairement compactes (données de démonstration, aucune prétention statistique).
 */
import { readNumber, readString, type FakerContext, type FakerGenerator } from '../types';

interface NameData {
  first: string[];
  last: string[];
}

const DATA: Record<string, NameData> = {
  en: {
    first: [
      'James',
      'Mary',
      'John',
      'Patricia',
      'Robert',
      'Jennifer',
      'Michael',
      'Linda',
      'William',
      'Elizabeth',
      'David',
      'Barbara',
    ],
    last: [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Wilson',
      'Taylor',
      'Moore',
      'Clark',
    ],
  },
  fr: {
    first: [
      'Gabriel',
      'Emma',
      'Louis',
      'Jade',
      'Raphaël',
      'Louise',
      'Arthur',
      'Alice',
      'Hugo',
      'Chloé',
      'Jules',
      'Léa',
    ],
    last: [
      'Martin',
      'Bernard',
      'Dubois',
      'Thomas',
      'Robert',
      'Richard',
      'Petit',
      'Durand',
      'Leroy',
      'Moreau',
      'Simon',
      'Laurent',
    ],
  },
};

/** Retire les diacritiques (pour fabriquer un e-mail ASCII). */
function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function pick(rng: () => number, list: string[]): string {
  return list[Math.floor(rng() * list.length)];
}

function emailOf(first: string, last: string): string {
  return `${stripAccents(first)}.${stripAccents(last)}@example.com`.toLowerCase();
}

export const personGenerator: FakerGenerator = {
  id: 'person',
  labelKey: 'tools.faker.generators.person',
  fields: [
    {
      kind: 'select',
      key: 'locale',
      labelKey: 'tools.faker.fields.locale',
      default: 'en',
      options: [
        { value: 'en', labelKey: 'tools.faker.locales.en' },
        { value: 'fr', labelKey: 'tools.faker.locales.fr' },
      ],
    },
    {
      kind: 'select',
      key: 'format',
      labelKey: 'tools.faker.fields.format',
      default: 'full',
      options: [
        { value: 'full', labelKey: 'tools.faker.personFormats.full' },
        { value: 'first', labelKey: 'tools.faker.personFormats.first' },
        { value: 'last', labelKey: 'tools.faker.personFormats.last' },
        { value: 'email', labelKey: 'tools.faker.personFormats.email' },
      ],
    },
    {
      kind: 'number',
      key: 'count',
      labelKey: 'tools.faker.fields.count',
      min: 1,
      max: 100,
      default: 5,
    },
  ],
  generate(options, ctx: FakerContext): string {
    const locale = readString(options, 'locale', 'en');
    const format = readString(options, 'format', 'full');
    const count = Math.max(0, Math.floor(readNumber(options, 'count', 5)));
    const data = DATA[locale] ?? DATA.en;

    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      // On tire toujours prénom ET nom (séquence stable quel que soit le format).
      const first = pick(ctx.rng, data.first);
      const last = pick(ctx.rng, data.last);
      if (format === 'first') list.push(first);
      else if (format === 'last') list.push(last);
      else if (format === 'email') list.push(emailOf(first, last));
      else list.push(`${first} ${last}`);
    }
    return list.join('\n');
  },
};
