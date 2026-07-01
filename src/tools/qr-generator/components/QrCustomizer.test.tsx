import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ColorControls, ShapeControls } from './QrCustomizer';

describe('ColorControls', () => {
  const colors = { dark: '#000000', light: '#ffffff' };

  it('applique une palette au clic', () => {
    const onChange = vi.fn();
    render(<ColorControls colors={colors} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /encre/i }));
    expect(onChange).toHaveBeenCalledWith({ dark: '#111827', light: '#ffffff' });
  });

  it('met à jour la couleur des modules via le picker', () => {
    const onChange = vi.fn();
    render(<ColorControls colors={colors} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/couleur du qr code/i), {
      target: { value: '#123456' },
    });
    expect(onChange).toHaveBeenCalledWith({ dark: '#123456', light: '#ffffff' });
  });
});

describe('ShapeControls', () => {
  it('sélectionne une forme et reflète l’état pressé', () => {
    const onChange = vi.fn();
    render(<ShapeControls shape="square" onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Carré' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Points' }));
    expect(onChange).toHaveBeenCalledWith('dots');
  });
});
