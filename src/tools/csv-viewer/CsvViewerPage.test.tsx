import { describe, expect, it, vi } from 'vitest';
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

  it('le bouton Exporter est désactivé à vide puis déclenche un téléchargement', async () => {
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    const revokeUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    render(<CsvViewerPage />);
    const exportBtn = screen.getByRole('button', { name: /exporter/i });
    expect(exportBtn).toBeDisabled();

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'name,age\nAlice,30' },
    });
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
    expect(exportBtn).toBeEnabled();

    fireEvent.click(exportBtn);
    expect(createUrl).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();

    createUrl.mockRestore();
    revokeUrl.mockRestore();
    click.mockRestore();
  });
});
