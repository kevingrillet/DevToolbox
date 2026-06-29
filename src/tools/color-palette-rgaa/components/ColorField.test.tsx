import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorField } from './ColorField';

describe('ColorField', () => {
  it('affiche la valeur hex et propage les changements', async () => {
    const onChange = vi.fn();
    render(<ColorField label="Texte" value="#1d4ed8" onChange={onChange} />);
    const hex = screen.getByLabelText('Texte (hex)');
    expect(hex).toHaveValue('#1d4ed8');
    await userEvent.type(hex, 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('marque le champ invalide quand la valeur n’est pas analysable', () => {
    render(<ColorField label="Texte" value="pas-hex" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Texte (hex)')).toHaveClass('border-danger');
  });
});
