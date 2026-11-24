import { screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { renderA11y } from '../../../test/a11y';
import { CodeImageSizeError, copyCodeImage } from '../lib/codeImage';
import { CopyCodeImageButton } from './CopyCodeImageButton';

vi.mock('../lib/codeImage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/codeImage')>()),
  copyCodeImage: vi.fn(),
}));

it('copie au clavier et annonce le résultat', async () => {
  vi.mocked(copyCodeImage).mockResolvedValueOnce('copied');
  const editorRef = { current: document.createElement('div') };
  const { user } = renderA11y(<CopyCodeImageButton source="const x = 1;" editorRef={editorRef} />);
  await user.tab();
  expect(screen.getByRole('button', { name: 'Copier en image' })).toHaveFocus();
  await user.keyboard('{Enter}');

  expect(copyCodeImage).toHaveBeenCalledWith(editorRef.current, 'const x = 1;');
  expect(await screen.findByRole('button', { name: 'Image copiée' })).toBeEnabled();
  expect(screen.getByRole('status')).toHaveTextContent('Image copiée');
});

it('indique quand le bloc dépasse les dimensions exportables', async () => {
  vi.mocked(copyCodeImage).mockRejectedValueOnce(new CodeImageSizeError());
  const editorRef = { current: document.createElement('div') };
  const { user } = renderA11y(<CopyCodeImageButton source="code" editorRef={editorRef} />);
  await user.click(screen.getByRole('button', { name: 'Copier en image' }));

  expect(screen.getByRole('status')).toHaveTextContent('Le bloc est trop grand');
});
