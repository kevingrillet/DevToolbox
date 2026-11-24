import { useState } from 'react';
import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { renderA11y } from '../../test/a11y';
import { CodeTextarea } from './CodeTextarea';

function EditableCode() {
  const [value, setValue] = useState('');
  return (
    <CodeTextarea
      label="Code"
      value={value}
      language="html"
      onChange={(event) => setValue(event.target.value)}
    />
  );
}

it('garde un seul champ natif éditable au clavier et affiche le balisage comme du texte', async () => {
  const { user, container } = renderA11y(<EditableCode />);
  const field = screen.getByRole('textbox', { name: 'Code' });
  await user.tab();
  expect(field).toHaveFocus();
  const source = '<img src="x">\n<p>Bonjour</p>';
  await user.paste(source);

  expect(field).toHaveValue(source);
  expect(container.querySelector('pre code')).toHaveTextContent('<img src="x">');
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('.syntax-editor-gutter')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getAllByRole('textbox')).toHaveLength(1);
});

it('associe les indications et l’erreur au champ en lecture seule', () => {
  renderA11y(
    <CodeTextarea label="Sortie" value="{}" language="json" hint="JSON" error="Erreur" readOnly />,
  );
  const field = screen.getByRole('textbox', { name: 'Sortie' });
  expect(field).toHaveAccessibleDescription('JSON Erreur');
  expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(field).toHaveAttribute('readonly');
  expect(screen.getByRole('alert')).toHaveTextContent('Erreur');
});
