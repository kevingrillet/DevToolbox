import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import HashChecksumPage from './HashChecksumPage';

describe('HashChecksumPage', () => {
  it('affiche les empreintes du texte saisi', async () => {
    render(<HashChecksumPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'abc' } });
    await waitFor(() =>
      expect(screen.getByText('900150983cd24fb0d6963f7d28e17f72')).toBeInTheDocument(),
    );
  });
});
