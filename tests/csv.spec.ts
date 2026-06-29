import { test, expect } from '@playwright/test';

test('depuis l’accueil : affiche un CSV en table', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Visualiseur CSV/i }).click();
  await expect(page).toHaveURL(/#\/csv-viewer$/);

  await page.getByLabel('CSV', { exact: true }).fill('name,age\nAnn,30\nBob,9');
  // En-tête en <th>, lignes en cellules.
  await expect(page.getByRole('columnheader', { name: /name/ })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Ann' })).toBeVisible();
});

test('trie par colonne au clic sur l’en-tête', async ({ page }) => {
  await page.goto('/#/csv-viewer');
  await page.getByLabel('CSV', { exact: true }).fill('name,age\nAnn,30\nBob,9\nCid,21');

  // Tri numérique croissant sur « age » : 9, 21, 30.
  await page.getByRole('button', { name: /age/ }).click();
  const firstRowAge = page.locator('tbody tr').first().locator('td').nth(1);
  await expect(firstRowAge).toHaveText('9');

  // Second clic : décroissant → 30 en tête.
  await page.getByRole('button', { name: /age/ }).click();
  await expect(page.locator('tbody tr').first().locator('td').nth(1)).toHaveText('30');
});
