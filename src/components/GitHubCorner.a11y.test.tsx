import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { renderA11y } from '../test/a11y';
import { GitHubCorner } from './GitHubCorner';

it('expose un lien nommé et accessible au clavier vers le dépôt', async () => {
  const { user } = renderA11y(<GitHubCorner />);
  const link = screen.getByRole('link', { name: 'Voir le code source sur GitHub' });

  await user.tab();

  expect(link).toHaveFocus();
  expect(link).toHaveAttribute('href', 'https://github.com/kevingrillet/DevToolbox');
});
