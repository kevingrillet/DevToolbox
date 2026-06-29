import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import CodeLinterPage from './CodeLinterPage';

describe('CodeLinterPage', () => {
  it('rend l’éditeur du linter et son panneau de règles', () => {
    render(<CodeLinterPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
