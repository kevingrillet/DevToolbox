import { test, expect } from '@playwright/test';

test('depuis l’accueil : noir sur blanc = 21:1 (AAA)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Palette de couleurs RGAA/i }).click();
  await expect(page).toHaveURL(/#\/color-palette-rgaa$/);

  // Couleur 1 (texte par défaut) → noir ; fond par défaut = couleur 2 (blanc).
  await page.getByLabel('Palette 1 (hex)').fill('#000000');
  await expect(page.getByText('21.00:1')).toBeVisible();
  await expect(page.getByText('AAA').first()).toBeVisible();
});

test('un contraste insuffisant propose une suggestion applicable', async ({ page }) => {
  await page.goto('/#/color-palette-rgaa');
  // Texte jaune sur fond blanc → échec.
  await page.getByLabel('Palette 1 (hex)').fill('#facc15');
  await expect(page.getByText('Échec').first()).toBeVisible();

  // Appliquer la suggestion AA assombrit le texte → plus aucun échec.
  await page.getByRole('button', { name: 'Appliquer (AA)', exact: true }).click();
  await expect(page.getByText('Échec')).toHaveCount(0);
});

test('exporte la palette en CSS', async ({ page }) => {
  await page.goto('/#/color-palette-rgaa');
  const output = page.getByLabel('Export');
  const value = await output.inputValue();
  expect(value).toContain(':root');
  expect(value).toContain('--color-1');
});
