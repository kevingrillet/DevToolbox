import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Section } from './Section';

describe('Section', () => {
  it('masque le contenu repliée, l’affiche au clic (aria-expanded)', () => {
    render(
      <Section title="Couleur" badge={2}>
        <p>contenu</p>
      </Section>,
    );
    const header = screen.getByRole('button', { name: /couleur/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('contenu')).not.toBeInTheDocument();

    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('contenu')).toBeInTheDocument();
  });

  it('rend le contenu d’emblée quand defaultOpen', () => {
    render(
      <Section title="Contenu" defaultOpen>
        <p>visible</p>
      </Section>,
    );
    expect(screen.getByText('visible')).toBeInTheDocument();
  });
});
