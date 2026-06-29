import { test, expect } from '@playwright/test';

test('depuis l’accueil : lint JS (var + console)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Linter de code/i }).click();
  await expect(page).toHaveURL(/#\/code-linter$/);

  await page.getByLabel('Code', { exact: true }).fill('var x = 1;\nconsole.log(x);');
  const results = page.locator('#lint-results');
  await expect(results).toContainText('Préférer let/const à var');
  await expect(results).toContainText('console.log oublié');
});

test('désactiver une règle la masque', async ({ page }) => {
  await page.goto('/#/code-linter');
  await page.getByLabel('Code', { exact: true }).fill('var x = 1;\nconsole.log(x);');
  const results = page.locator('#lint-results');
  await expect(results).toContainText('console.log oublié');

  await page.getByRole('button', { name: 'Règles' }).click();
  await page.getByLabel('console.log oublié', { exact: true }).uncheck();
  await expect(results).not.toContainText('console.log oublié');
  await expect(results).toContainText('Préférer let/const à var');
});

test('changer de langage applique d’autres règles (CSS)', async ({ page }) => {
  await page.goto('/#/code-linter');
  await page.getByLabel('Langage').selectOption('css');
  await page.getByLabel('Code', { exact: true }).fill('a { color: red !important; }');
  await expect(page.locator('#lint-results')).toContainText('!important à éviter');
});
