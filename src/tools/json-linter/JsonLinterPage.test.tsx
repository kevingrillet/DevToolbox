import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import JsonLinterPage from './JsonLinterPage';

describe('JsonLinterPage', () => {
  it('affiche l’arbre quand le JSON est valide', async () => {
    render(<JsonLinterPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '{"a":1}' } });
    await waitFor(() => expect(screen.getByText('a:')).toBeInTheDocument());
  });
});
