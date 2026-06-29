import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MarkdownEditorPage from './MarkdownEditorPage';

describe('MarkdownEditorPage', () => {
  it('rend l’éditeur et l’aperçu live', async () => {
    render(<MarkdownEditorPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '# Titre' } });
    await waitFor(() => expect(screen.getByText('Titre')).toBeInTheDocument());
  });
});
