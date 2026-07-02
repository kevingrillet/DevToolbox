import { test, expect } from '@playwright/test';

test('le cache conserve le texte après rechargement', async ({ page }) => {
  await page.goto('/#/markdown-editor');
  const editor = page.getByLabel('Markdown', { exact: true });
  await editor.fill('# Cached');
  await page.getByLabel('Conserver en cache').check();

  await page.reload();
  await expect(page.getByLabel('Markdown', { exact: true })).toHaveValue('# Cached');
});

test('sans cache, le texte ne survit pas au rechargement', async ({ page }) => {
  await page.goto('/#/markdown-editor');
  const editor = page.getByLabel('Markdown', { exact: true });
  // L'éditeur démarre sur un exemple (cf. useMarkdownStore) ; on le mémorise pour
  // vérifier qu'on y revient après rechargement.
  const example = await editor.inputValue();
  await editor.fill('# Volatile');
  await page.reload();
  // Sans cache activé, la saisie est perdue et l'éditeur revient à l'exemple.
  await expect(page.getByLabel('Markdown', { exact: true })).toHaveValue(example);
});
