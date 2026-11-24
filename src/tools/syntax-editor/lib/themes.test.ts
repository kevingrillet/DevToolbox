import { describe, expect, it } from 'vitest';
import { contrastRatio, parseHex } from '../../color-palette-rgaa/lib/color';
import { DEFAULT_CUSTOM_PALETTE, parseSyntaxSettings, PRISM_THEMES } from './themes';

describe('réglages de l’éditeur Prism', () => {
  it.each(['', '{', 'null', '{"language":"unknown","theme":"constructor"}'])(
    'reprend les valeurs par défaut avec %j',
    (value) => {
      expect(parseSyntaxSettings(value)).toEqual({
        language: 'javascript',
        theme: 'auto',
        custom: DEFAULT_CUSTOM_PALETTE,
      });
    },
  );

  it('restaure uniquement des couleurs hexadécimales valides', () => {
    expect(
      parseSyntaxSettings(
        '{"language":"python","theme":"custom","custom":{"keyword":"#AfFa52","string":"red"}}',
      ),
    ).toEqual({
      language: 'python',
      theme: 'custom',
      custom: { ...DEFAULT_CUSTOM_PALETTE, keyword: '#AfFa52' },
    });
  });

  it('remplace l’ancienne palette par défaut, et conserve une palette modifiée', () => {
    const legacy = PRISM_THEMES.prism.palette;
    const edited = { ...legacy, keyword: '#010203' };

    expect(parseSyntaxSettings(JSON.stringify({ custom: legacy })).custom).toEqual(
      DEFAULT_CUSTOM_PALETTE,
    );
    expect(parseSyntaxSettings(JSON.stringify({ custom: edited })).custom).toEqual(edited);
  });

  it('utilise du blanc et garde un contraste de 7:1 pour le texte et chaque catégorie', () => {
    const { background, ...inkColors } = DEFAULT_CUSTOM_PALETTE;
    expect(background).toBe('#ffffff');

    for (const [token, hex] of Object.entries(inkColors)) {
      expect(contrastRatio(parseHex(background)!, parseHex(hex)!), token).toBeGreaterThanOrEqual(7);
    }
  });

  it.each(Object.values(PRISM_THEMES))(
    'respecte le contraste du texte pour $label',
    ({ palette }) => {
      const background = parseHex(palette.background)!;
      for (const [token, hex] of Object.entries(palette)) {
        if (token !== 'background')
          expect(contrastRatio(background, parseHex(hex)!), token).toBeGreaterThanOrEqual(4.5);
      }
    },
  );
});
