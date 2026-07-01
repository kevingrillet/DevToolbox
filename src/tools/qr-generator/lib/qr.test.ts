import { describe, it, expect } from 'vitest';
import { toStylingOptions } from './qr';

/**
 * `toStylingOptions` est une transformation pure (pas de DOM), donc testable
 * directement. Le rendu réel (canvas/SVG, téléchargement) dépend du navigateur et
 * est couvert par les tests Playwright (tests/qr.spec.ts).
 */
describe('toStylingOptions', () => {
  it('applique les valeurs par défaut (noir sur blanc, correction M, carré)', () => {
    const opts = toStylingOptions('hello');
    expect(opts.data).toBe('hello');
    expect(opts.dotsOptions?.color).toBe('#000000');
    expect(opts.backgroundOptions?.color).toBe('#ffffff');
    expect(opts.dotsOptions?.type).toBe('square');
    expect(opts.qrOptions?.errorCorrectionLevel).toBe('M');
  });

  it('applique les couleurs fournies aux modules, aux coins et au fond', () => {
    const opts = toStylingOptions('x', { colors: { dark: '#123456', light: '#eeeeee' } });
    expect(opts.dotsOptions?.color).toBe('#123456');
    expect(opts.cornersSquareOptions?.color).toBe('#123456');
    expect(opts.cornersDotOptions?.color).toBe('#123456');
    expect(opts.backgroundOptions?.color).toBe('#eeeeee');
  });

  it('mappe la forme « points » vers des modules ronds', () => {
    const opts = toStylingOptions('x', { shape: 'dots' });
    expect(opts.dotsOptions?.type).toBe('dots');
    expect(opts.cornersSquareOptions?.type).toBe('dot');
  });

  it('mappe la forme « arrondi » vers extra-rounded', () => {
    const opts = toStylingOptions('x', { shape: 'rounded' });
    expect(opts.dotsOptions?.type).toBe('extra-rounded');
    expect(opts.cornersSquareOptions?.type).toBe('extra-rounded');
  });

  it('propage le niveau de correction et la taille', () => {
    const opts = toStylingOptions('x', { errorCorrectionLevel: 'H', width: 1024 });
    expect(opts.qrOptions?.errorCorrectionLevel).toBe('H');
    expect(opts.width).toBe(1024);
    expect(opts.height).toBe(1024);
  });

  it('propage la densité (version) forcée', () => {
    expect(toStylingOptions('x', { typeNumber: 7 }).qrOptions?.typeNumber).toBe(7);
    expect(toStylingOptions('x').qrOptions?.typeNumber).toBe(0); // 0 = auto par défaut
  });

  it('incruste le logo et masque les modules sous l’image', () => {
    const opts = toStylingOptions('x', { image: 'data:image/png;base64,AAAA' });
    expect(opts.image).toBe('data:image/png;base64,AAAA');
    expect(opts.imageOptions?.hideBackgroundDots).toBe(true);
  });

  it('n’incruste aucune image par défaut', () => {
    expect(toStylingOptions('x').image).toBeUndefined();
  });
});
