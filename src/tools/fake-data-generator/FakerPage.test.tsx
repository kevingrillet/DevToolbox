import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import FakerPage from './FakerPage';

describe('FakerPage', () => {
  it('rend le générateur avec une sortie non vide', () => {
    render(<FakerPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    // La zone de sortie (readOnly) est alimentée par le store.
    const output = screen
      .getAllByRole('textbox')
      .find((el) => (el as HTMLTextAreaElement).readOnly);
    expect(output).toBeDefined();
    expect((output as HTMLTextAreaElement).value.length).toBeGreaterThan(0);
  });
});
