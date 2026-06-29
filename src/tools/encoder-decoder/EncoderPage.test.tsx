import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EncoderPage from './EncoderPage';

describe('EncoderPage', () => {
  it('encode l’entrée en base64 dans la sortie', async () => {
    render(<EncoderPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'hello' } });
    await waitFor(() => expect(screen.getByDisplayValue('aGVsbG8=')).toBeInTheDocument());
  });
});
