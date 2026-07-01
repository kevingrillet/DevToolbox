import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MarkdownEditorPage from './MarkdownEditorPage';

describe('MarkdownEditorPage', () => {
  it('rend l’éditeur et l’aperçu live', async () => {
    render(<MarkdownEditorPage />);
    // Le titre de la page (l'aperçu peut contenir d'autres h1 issus du Markdown).
    expect(
      screen.getByRole('heading', { level: 1, name: /éditeur markdown/i }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '# Titre' } });
    await waitFor(() => expect(screen.getByText('Titre')).toBeInTheDocument());
  });

  it('démarre sur un exemple non vide', () => {
    render(<MarkdownEditorPage />);
    expect((screen.getAllByRole('textbox')[0] as HTMLTextAreaElement).value).toContain('Bienvenue');
  });
});
