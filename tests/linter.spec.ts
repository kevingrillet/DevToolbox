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

test('trouve le linter avec Python et applique ses règles configurables', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox').fill('python');
  await page.getByRole('link', { name: /Linter de code/i }).click();
  await page.getByLabel('Langage').selectOption({ label: 'Python' });
  await page.getByLabel('Code', { exact: true }).fill('try:\n\tload()\nexcept:\n    pass');

  const results = page.locator('#lint-results');
  const bareExcept = 'Préciser les exceptions à intercepter dans except';
  await expect(results).toContainText('Préférer les espaces aux tabulations');
  await expect(results).toContainText(bareExcept);

  await page.getByRole('button', { name: 'Règles' }).click();
  await page.getByLabel(bareExcept, { exact: true }).uncheck();
  await expect(results).not.toContainText(bareExcept);
});

test('reformate une source Python depuis le bouton du linter', async ({ page }) => {
  await page.goto('/#/code-linter');
  await page.getByLabel('Langage').selectOption('python');
  const source = page.getByLabel('Code', { exact: true });
  const format = page.getByRole('button', { name: 'Reformater' });
  await expect(format).toBeDisabled();

  await source.fill('def greet():\n\treturn "hello  "  ');
  await format.click();

  await expect(source).toHaveValue('def greet():\n        return "hello  "');
  await expect(page.locator('#lint-results')).toContainText('Aucun problème détecté.');
});
