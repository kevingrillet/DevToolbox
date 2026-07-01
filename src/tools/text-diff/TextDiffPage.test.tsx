import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TextDiffPage from './TextDiffPage';

describe('TextDiffPage', () => {
  it('rend les deux zones et le résultat du diff (granularité Ligne par défaut)', async () => {
    render(<TextDiffPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    const boxes = screen.getAllByRole('textbox');
    fireEvent.change(boxes[0], { target: { value: 'ligne identique\nancienne' } });
    fireEvent.change(boxes[1], { target: { value: 'ligne identique\nnouvelle' } });
    // La ligne modifiée apparaît (suppression + ajout) dans le DiffView.
    await waitFor(() => expect(screen.getByText('nouvelle')).toBeInTheDocument());
    expect(screen.getByText('ancienne')).toBeInTheDocument();
  });

  it('le bouton « Trier les lignes » trie le texte source', async () => {
    render(<TextDiffPage />);
    const boxes = screen.getAllByRole('textbox');
    fireEvent.change(boxes[0], { target: { value: 'b\na' } });
    fireEvent.change(boxes[1], { target: { value: 'a\nb' } });
    fireEvent.click(screen.getByRole('button', { name: /trier les lignes/i }));
    await waitFor(() => expect((boxes[0] as HTMLTextAreaElement).value).toBe('a\nb'));
  });
});
