import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Hint } from './Hint';

describe('Hint', () => {
  it('relie le bouton au texte d’aide (aria-describedby) et l’ouvre au focus', () => {
    render(<Hint label="Aide – densité">Texte d’aide</Hint>);
    const button = screen.getByRole('button', { name: 'Aide – densité' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('tooltip')).toHaveTextContent('Texte d’aide');

    fireEvent.focus(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(button, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
