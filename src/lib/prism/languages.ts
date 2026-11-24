export const CODE_LANGUAGES = {
  plain: null,
  bash: 'Bash',
  csharp: 'C#',
  css: 'CSS',
  csv: 'CSV',
  html: 'HTML / XML',
  javascript: 'JavaScript',
  json: 'JSON',
  markdown: 'Markdown',
  python: 'Python',
  sql: 'SQL',
  typescript: 'TypeScript',
  yaml: 'YAML',
} as const;

export type CodeLanguage = keyof typeof CODE_LANGUAGES;

export function isCodeLanguage(value: unknown): value is CodeLanguage {
  return typeof value === 'string' && Object.hasOwn(CODE_LANGUAGES, value);
}
