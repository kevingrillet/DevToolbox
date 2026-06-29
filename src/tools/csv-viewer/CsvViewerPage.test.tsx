import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CsvViewerPage from './CsvViewerPage';

describe('CsvViewerPage', () => {
  it('affiche la table après saisie d’un CSV', async () => {
    render(<CsvViewerPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'name,age\nAlice,30' },
    });
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
  });
});
