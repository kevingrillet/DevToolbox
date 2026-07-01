import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CodeLinterPage from './CodeLinterPage';

describe('CodeLinterPage', () => {
  it('rend l’éditeur du linter et son panneau de règles', () => {
    render(<CodeLinterPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('le bouton Reformater réindente la source', () => {
    render(<CodeLinterPage />);
    const source = screen.getAllByRole('textbox')[0] as HTMLTextAreaElement;
    fireEvent.change(source, { target: { value: 'function f() {\nreturn 1;\n}' } });
    fireEvent.click(screen.getByRole('button', { name: /reformater/i }));
    expect(source.value).toBe('function f() {\n  return 1;\n}');
  });
});
