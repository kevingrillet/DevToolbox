/**
 * Générateur de Lorem Ipsum paramétrable (mots / phrases / paragraphes), avec
 * option d'en-tête classique « Lorem ipsum dolor sit amet… ». Déterministe via le
 * `rng` injecté.
 */
import {
  readBoolean,
  readNumber,
  readString,
  type FakerContext,
  type FakerGenerator,
} from '../types';

const WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'eu',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
];

const OPENING_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];
const CLASSIC_SENTENCE =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

function capitalize(text: string): string {
  return text.length === 0 ? text : text[0].toUpperCase() + text.slice(1);
}

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pickWord(rng: () => number): string {
  return WORDS[Math.floor(rng() * WORDS.length)];
}

function makeSentence(rng: () => number): string {
  const length = randInt(rng, 6, 14);
  const words: string[] = [];
  for (let i = 0; i < length; i++) words.push(pickWord(rng));
  return `${capitalize(words.join(' '))}.`;
}

function makeParagraph(rng: () => number): string {
  const count = randInt(rng, 3, 6);
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) sentences.push(makeSentence(rng));
  return sentences.join(' ');
}

export const loremGenerator: FakerGenerator = {
  id: 'lorem-ipsum',
  labelKey: 'tools.faker.generators.lorem',
  fields: [
    {
      kind: 'select',
      key: 'unit',
      labelKey: 'tools.faker.fields.unit',
      default: 'paragraphs',
      options: [
        { value: 'words', labelKey: 'tools.faker.units.words' },
        { value: 'sentences', labelKey: 'tools.faker.units.sentences' },
        { value: 'paragraphs', labelKey: 'tools.faker.units.paragraphs' },
      ],
    },
    {
      kind: 'number',
      key: 'count',
      labelKey: 'tools.faker.fields.count',
      min: 1,
      max: 100,
      default: 3,
    },
    {
      kind: 'boolean',
      key: 'startWithLorem',
      labelKey: 'tools.faker.fields.startWithLorem',
      default: true,
    },
  ],
  generate(options, ctx: FakerContext): string {
    const unit = readString(options, 'unit', 'paragraphs');
    const count = Math.max(0, Math.floor(readNumber(options, 'count', 3)));
    const startWithLorem = readBoolean(options, 'startWithLorem', true);
    const rng = ctx.rng;

    if (unit === 'words') {
      const words: string[] = [];
      for (let i = 0; i < count; i++) words.push(pickWord(rng));
      if (startWithLorem) {
        for (let i = 0; i < Math.min(count, OPENING_WORDS.length); i++) words[i] = OPENING_WORDS[i];
      }
      return words.length === 0 ? '' : capitalize(words.join(' '));
    }

    if (unit === 'sentences') {
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) sentences.push(makeSentence(rng));
      if (startWithLorem && sentences.length > 0) sentences[0] = CLASSIC_SENTENCE;
      return sentences.join(' ');
    }

    // paragraphs
    const paragraphs: string[] = [];
    for (let i = 0; i < count; i++) paragraphs.push(makeParagraph(rng));
    if (startWithLorem && paragraphs.length > 0) {
      paragraphs[0] = `${CLASSIC_SENTENCE} ${paragraphs[0]}`;
    }
    return paragraphs.join('\n\n');
  },
};
