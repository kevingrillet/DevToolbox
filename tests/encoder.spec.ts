import { test, expect } from '@playwright/test';

const JWT_REFERENCE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

test('depuis l’accueil, ouvre l’encodeur et encode en Base64', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Encodeur \/ Décodeur/i }).click();
  await expect(page).toHaveURL(/#\/encoder-decoder$/);
  await expect(page.getByRole('heading', { name: 'Encodeur / Décodeur', level: 1 })).toBeVisible();

  await page.getByLabel('Entrée').fill('Hello');
  await expect(page.getByLabel('Sortie')).toHaveValue('SGVsbG8=');
});

test('décode du Base64', async ({ page }) => {
  await page.goto('/#/encoder-decoder');
  await page.getByLabel('Sens').selectOption('decode');
  await page.getByLabel('Entrée').fill('SGVsbG8=');
  await expect(page.getByLabel('Sortie')).toHaveValue('Hello');
});

test('le bouton d’interversion échange entrée/sortie et inverse le sens', async ({ page }) => {
  await page.goto('/#/encoder-decoder');
  await page.getByLabel('Entrée').fill('Hello');
  await expect(page.getByLabel('Sortie')).toHaveValue('SGVsbG8=');

  await page.getByRole('button', { name: /Intervertir/ }).click();
  await expect(page.getByLabel('Entrée')).toHaveValue('SGVsbG8=');
  await expect(page.getByLabel('Sens')).toHaveValue('decode');
  await expect(page.getByLabel('Sortie')).toHaveValue('Hello');
});

test('décode un JWT et affiche le payload + l’état d’expiration', async ({ page }) => {
  await page.goto('/#/encoder-decoder');
  await page.getByLabel('Format').selectOption('jwt');
  await page.getByLabel('Entrée').fill(JWT_REFERENCE);

  await expect(page.getByText('John Doe')).toBeVisible();
  // Le jeton de référence n'a pas de claim `exp`.
  await expect(page.getByText('Sans expiration')).toBeVisible();
});
