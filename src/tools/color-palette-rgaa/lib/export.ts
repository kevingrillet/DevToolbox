/**
 * Export de la palette dans différents formats. Les couleurs sont nommées
 * `color-1`, `color-2`… (renommage manuel laissé à l'utilisateur ensuite).
 */
export type ExportFormat = 'css' | 'json' | 'tailwind';

export function exportPalette(colors: string[], format: ExportFormat): string {
  const named = colors.map((value, index) => ({ name: `color-${index + 1}`, value }));

  if (format === 'css') {
    return `:root {\n${named.map((n) => `  --${n.name}: ${n.value};`).join('\n')}\n}`;
  }

  if (format === 'json') {
    return JSON.stringify(Object.fromEntries(named.map((n) => [n.name, n.value])), null, 2);
  }

  // tailwind
  const body = named.map((n) => `        '${n.name}': '${n.value}',`).join('\n');
  return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${body}\n      },\n    },\n  },\n};`;
}
