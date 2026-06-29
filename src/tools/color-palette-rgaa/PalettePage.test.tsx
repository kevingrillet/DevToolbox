import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PalettePage from './PalettePage';

describe('PalettePage', () => {
  it('rend la page (contraste des couleurs par défaut)', () => {
    render(<PalettePage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
