/**
 * Tests d'accessibilité de `Section` (carte dépliable / accordéon).
 *
 * On vérifie le contrat d'accessibilité d'un accordéon RGAA/WCAG :
 *  - l'en-tête est un vrai `<button>` porté par un titre du niveau demandé
 *    (hiérarchie RGAA 9.1) ;
 *  - `aria-expanded` reflète l'état, `aria-controls` référence le panneau ;
 *  - le contenu n'est présent dans le DOM que lorsque la section est ouverte ;
 *  - la bascule fonctionne au clavier (Entrée, Espace).
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Section } from './Section';
import { renderA11y } from '../../../test/a11y';

describe('Section (a11y)', () => {
  it('porte l’en-tête par un titre du niveau demandé, bouton nommé', () => {
    renderA11y(
      <Section title="Contenu" headingLevel={3}>
        <p>corps</p>
      </Section>,
    );
    const heading = screen.getByRole('heading', { level: 3, name: 'Contenu' });
    expect(heading).toBeInTheDocument();
    // Le bouton d'interaction est bien à l'intérieur du titre.
    expect(heading.querySelector('button')).not.toBeNull();
  });

  it('masque le contenu quand la section est repliée (défaut)', () => {
    renderA11y(
      <Section title="Contenu">
        <p>corps caché</p>
      </Section>,
    );
    const btn = screen.getByRole('button', { name: /Contenu/ });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('corps caché')).not.toBeInTheDocument();
  });

  it('révèle le contenu et lie `aria-controls` au panneau quand ouverte', () => {
    renderA11y(
      <Section title="Contenu" defaultOpen>
        <p>corps visible</p>
      </Section>,
    );
    const btn = screen.getByRole('button', { name: /Contenu/ });
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    const panelId = btn.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    const panel = screen.getByText('corps visible').closest(`#${panelId}`);
    expect(panel).not.toBeNull();
  });

  it('bascule au clavier (Entrée puis Espace)', async () => {
    const { user } = renderA11y(
      <Section title="Contenu">
        <p>corps</p>
      </Section>,
    );
    const btn = screen.getByRole('button', { name: /Contenu/ });
    await user.tab();
    expect(btn).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('corps')).toBeInTheDocument();

    await user.keyboard(' ');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('corps')).not.toBeInTheDocument();
  });
});
