import { Fragment, type ReactNode } from 'react';
import type { TokenStream } from 'prismjs';

export function renderTokens(tokens: TokenStream): ReactNode {
  if (typeof tokens === 'string') return tokens;
  if (Array.isArray(tokens)) {
    return tokens.map((token, index) => <Fragment key={index}>{renderTokens(token)}</Fragment>);
  }

  const aliases = typeof tokens.alias === 'string' ? [tokens.alias] : (tokens.alias ?? []);
  return (
    <span className={['token', tokens.type, ...aliases].join(' ')}>
      {renderTokens(tokens.content)}
    </span>
  );
}
