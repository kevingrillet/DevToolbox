import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import QrGeneratorPage from './QrGeneratorPage';

// On reste volontairement sur un formulaire non rempli (ready === false) : l'aperçu
// affiche l'invite et n'instancie pas `qr-code-styling` (canvas indisponible en jsdom).
describe('QrGeneratorPage', () => {
  it('rend le titre, le sélecteur de type et l’invite de l’aperçu', () => {
    render(<QrGeneratorPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /générateur de qr/i }),
    ).toBeInTheDocument();
    // Les 8 types sont proposés (radiogroup).
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(8);
    // Invite affichée tant que le formulaire n'est pas exploitable.
    expect(screen.getByText(/remplissez le formulaire/i)).toBeInTheDocument();
  });

  it('change de type de contenu (WiFi) et affiche ses champs', () => {
    render(<QrGeneratorPage />);
    fireEvent.click(screen.getByRole('radio', { name: /wifi/i }));
    expect(screen.getByText(/nom du réseau/i)).toBeInTheDocument();
  });
});
