import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TextDiffPage from './TextDiffPage';

describe('TextDiffPage', () => {
  it('rend les deux zones et le résultat du diff', async () => {
    render(<TextDiffPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    const boxes = screen.getAllByRole('textbox');
    fireEvent.change(boxes[0], { target: { value: 'hello world' } });
    fireEvent.change(boxes[1], { target: { value: 'hello brave world' } });
    // Le mot ajouté apparaît dans le DiffView.
    await waitFor(() => expect(screen.getByText('brave')).toBeInTheDocument());
  });
});
