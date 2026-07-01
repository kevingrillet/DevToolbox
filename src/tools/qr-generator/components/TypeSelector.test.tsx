import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TypeSelector } from './TypeSelector';
import { PAYLOAD_TYPES } from '../lib/payloads';

describe('TypeSelector', () => {
  it('rend un radio par type (radiogroup)', () => {
    render(<TypeSelector types={PAYLOAD_TYPES} activeId="text" onChange={() => {}} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(PAYLOAD_TYPES.length);
    expect(screen.getByRole('radio', { name: /texte/i })).toHaveAttribute('aria-checked', 'true');
  });

  it('remonte le type au clic', () => {
    const onChange = vi.fn();
    render(<TypeSelector types={PAYLOAD_TYPES} activeId="text" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: /wifi/i }));
    expect(onChange).toHaveBeenCalledWith('wifi');
  });

  it('navigue au clavier (flèche droite → type suivant, avec bouclage)', () => {
    const onChange = vi.fn();
    render(<TypeSelector types={PAYLOAD_TYPES} activeId="text" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('radio', { name: /texte/i }), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(PAYLOAD_TYPES[1].id);
  });

  it('Début/Fin vont au premier/dernier type', () => {
    const onChange = vi.fn();
    render(<TypeSelector types={PAYLOAD_TYPES} activeId="url" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('radio', { name: /^url$/i }), { key: 'End' });
    expect(onChange).toHaveBeenCalledWith(PAYLOAD_TYPES[PAYLOAD_TYPES.length - 1].id);
  });
});
