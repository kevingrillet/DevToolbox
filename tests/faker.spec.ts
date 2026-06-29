import { test, expect } from '@playwright/test';

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test('depuis l’accueil, génère du Lorem Ipsum par défaut', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /données factices/i }).click();
  await expect(page).toHaveURL(/#\/fake-data-generator$/);
  expect(await page.getByLabel('Sortie').inputValue()).toContain('Lorem ipsum');
});

test('génère des UUID v4', async ({ page }) => {
  await page.goto('/#/fake-data-generator');
  await page.getByLabel('Générateur', { exact: true }).selectOption('uuid');
  const first = (await page.getByLabel('Sortie').inputValue()).split('\n')[0];
  expect(first).toMatch(V4);
});

test('une graine rend la sortie reproductible', async ({ page }) => {
  await page.goto('/#/fake-data-generator');
  await page.getByLabel('Graine').fill('devtools');
  const output = page.getByLabel('Sortie');
  const before = await output.inputValue();
  // Graine fixée ⇒ « Régénérer » ne change rien.
  await page.getByRole('button', { name: 'Régénérer' }).click();
  expect(await output.inputValue()).toBe(before);
});
