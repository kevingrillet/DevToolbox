import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('affiche la page d’accueil avec les outils du registre', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Outils', level: 1 })).toBeInTheDocument();
    // Le registre contient l'encodeur : sa carte (lien) apparaît sur l'accueil.
    expect(screen.getByRole('link', { name: /Encodeur \/ Décodeur/i })).toBeInTheDocument();
  });

  it('expose la marque (lien vers l’accueil) et les contrôles de thème/langue', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /DevTools Hub/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Thème' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Passer en anglais' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activer le mode sombre' })).toBeInTheDocument();
  });
});
