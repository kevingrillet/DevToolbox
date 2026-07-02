import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LogoControls } from './LogoControls';

describe('LogoControls', () => {
  it('affiche le bouton d’import quand aucun logo', () => {
    render(<LogoControls logo="" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /importer une image/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retirer le logo/i })).not.toBeInTheDocument();
  });

  it('affiche l’aperçu et permet de retirer un logo présent', () => {
    const onChange = vi.fn();
    render(<LogoControls logo="data:image/png;base64,AAAA" onChange={onChange} />);
    expect(screen.getByRole('img', { name: /logo du qr code/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retirer le logo/i }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('lit un fichier choisi en data URL et le remonte', async () => {
    const onChange = vi.fn();
    const { container } = render(<LogoControls logo="" onChange={onChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    // FileReader.readAsDataURL est asynchrone → on attend l'appel.
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^data:/)));
  });

  it('refuse un logo trop lourd et affiche une alerte', async () => {
    const onChange = vi.fn();
    const { container } = render(<LogoControls logo="" onChange={onChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    // Fichier > 1 Mio → garde-fou de poids déclenché.
    const big = new File(['a'.repeat(1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [big] } });
    expect(await screen.findByRole('alert')).toHaveTextContent(/trop volumineuse/i);
    expect(onChange).not.toHaveBeenCalled();
  });
});
