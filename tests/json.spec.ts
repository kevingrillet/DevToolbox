import { test, expect } from '@playwright/test';

const SAMPLE = '{"users":[{"name":"Ann"}]}';

test('depuis l’accueil : JSON valide → arbre explorable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /JSON Linter/i }).click();
  await expect(page).toHaveURL(/#\/json-linter$/);

  await page.getByLabel('JSON', { exact: true }).fill(SAMPLE);
  await expect(page.getByText('JSON valide')).toBeVisible();

  await page.getByRole('button', { name: 'Tout déplier' }).click();
  await expect(page.getByText('"Ann"', { exact: true })).toBeVisible();
});

test('JSON invalide → erreur localisée', async ({ page }) => {
  await page.goto('/#/json-linter');
  await page.getByLabel('JSON', { exact: true }).fill('{"a":1,}');
  await expect(page.getByText('JSON invalide')).toBeVisible();
  await expect(page.getByText(/colonne 8/)).toBeVisible();
});

test('recherche JSONPath sélectionne et révèle le nœud', async ({ page }) => {
  await page.goto('/#/json-linter');
  await page.getByLabel('JSON', { exact: true }).fill(SAMPLE);
  await page.getByLabel('Recherche').fill('$.users[0].name');
  await expect(page.getByText('1/1')).toBeVisible();
  await expect(page.getByText('"Ann"', { exact: true })).toBeVisible();
});

test('reformatage indente le JSON', async ({ page }) => {
  await page.goto('/#/json-linter');
  const input = page.getByLabel('JSON', { exact: true });
  await input.fill('{"a":1}');
  await page.getByRole('button', { name: 'Reformater' }).click();
  expect(await input.inputValue()).toContain('\n  "a"');
});
