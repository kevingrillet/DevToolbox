import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QrOutputControls } from './QrOutputControls';

function setup(overrides = {}) {
  const props = {
    ecLevel: 'M' as const,
    onEcLevelChange: vi.fn(),
    density: 0,
    onDensityChange: vi.fn(),
    size: 512,
    onSizeChange: vi.fn(),
    ...overrides,
  };
  render(<QrOutputControls {...props} />);
  return props;
}

describe('QrOutputControls', () => {
  it('change le niveau de correction', () => {
    // getByRole combobox cible le <select> (le bouton d'aide Hint partage le libellé).
    const props = setup();
    fireEvent.change(screen.getByRole('combobox', { name: /niveau de correction/i }), {
      target: { value: 'H' },
    });
    expect(props.onEcLevelChange).toHaveBeenCalledWith('H');
  });

  it('change la densité (version forcée)', () => {
    const props = setup();
    fireEvent.change(screen.getByRole('combobox', { name: /densité/i }), {
      target: { value: '7' },
    });
    expect(props.onDensityChange).toHaveBeenCalledWith(7);
  });

  it('change la taille via le curseur', () => {
    const props = setup();
    fireEvent.change(screen.getByRole('slider', { name: /taille de l/i }), {
      target: { value: '1024' },
    });
    expect(props.onSizeChange).toHaveBeenCalledWith(1024);
  });

  it('expose des bulles d’aide', () => {
    setup();
    expect(screen.getAllByRole('button', { name: /aide/i }).length).toBeGreaterThan(0);
  });
});
