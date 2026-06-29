import { test, expect } from '@playwright/test';

test('depuis l’accueil : diff par mot (ajout + suppression)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Comparateur de texte/i }).click();
  await expect(page).toHaveURL(/#\/text-diff$/);

  await page.getByLabel('Avant').fill('one two three');
  await page.getByLabel('Après').fill('one four three');

  // Vue unifiée par défaut : le mot supprimé et le mot ajouté apparaissent.
  await expect(page.getByText('two', { exact: true })).toBeVisible();
  await expect(page.getByText('four', { exact: true })).toBeVisible();
});

test('ignorer la casse rend les textes identiques', async ({ page }) => {
  await page.goto('/#/text-diff');
  await page.getByLabel('Avant').fill('Hello');
  await page.getByLabel('Après').fill('hello');
  await expect(page.getByText('Identique')).toHaveCount(0);

  await page.getByLabel('Ignorer la casse').check();
  await expect(page.getByText('Identique')).toBeVisible();
});

test('bascule en vue côte à côte', async ({ page }) => {
  await page.goto('/#/text-diff');
  await page.getByLabel('Avant').fill('alpha beta');
  await page.getByLabel('Après').fill('alpha gamma');
  await page.getByLabel('Affichage').selectOption('split');

  await expect(page.getByText('beta', { exact: true })).toBeVisible();
  await expect(page.getByText('gamma', { exact: true })).toBeVisible();
});

test('le tri des lignes rend deux listes identiques', async ({ page }) => {
  await page.goto('/#/text-diff');
  await page.getByLabel('Avant').fill('b\na\nc');
  await page.getByLabel('Après').fill('a\nb\nc');
  await expect(page.getByText('Identique')).toHaveCount(0);

  await page.getByLabel('Trier les lignes').check();
  await expect(page.getByText('Identique')).toBeVisible();
});
