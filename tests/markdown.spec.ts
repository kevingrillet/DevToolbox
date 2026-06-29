import { test, expect } from '@playwright/test';

test('depuis l’accueil : le Markdown est rendu dans l’aperçu', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Éditeur Markdown/i }).click();
  await expect(page).toHaveURL(/#\/markdown-editor$/);

  await page.getByLabel('Markdown', { exact: true }).fill('# Hello\n\n**bold**');
  await expect(page.getByRole('heading', { name: 'Hello', level: 1 })).toBeVisible();
  await expect(page.locator('#md-preview strong')).toHaveText('bold');
});

test('le HTML dangereux est neutralisé dans l’aperçu', async ({ page }) => {
  await page.goto('/#/markdown-editor');
  await page.getByLabel('Markdown', { exact: true }).fill('<script>alert(1)</script>safe text');
  await expect(page.locator('#md-preview')).toContainText('safe text');
  await expect(page.locator('#md-preview script')).toHaveCount(0);
});
