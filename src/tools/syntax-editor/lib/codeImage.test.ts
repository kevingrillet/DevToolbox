import { expect, it } from 'vitest';
import { layoutCodeLines } from './codeImage';

it('place les couleurs, les tabulations et les lignes vides dans le bloc entier', () => {
  const result = layoutCodeLines(
    [
      { text: 'const', color: 'blue' },
      { text: '\tvalue\n\n', color: 'black' },
      { text: '\t"ok"\n', color: 'green' },
    ],
    (text) => text.length * 10,
    4,
  );

  expect(result).toEqual({
    width: 130,
    lines: [
      [
        { text: 'const', color: 'blue', x: 0 },
        { text: 'value', color: 'black', x: 80 },
      ],
      [],
      [{ text: '"ok"', color: 'green', x: 40 }],
      [],
    ],
  });
});
