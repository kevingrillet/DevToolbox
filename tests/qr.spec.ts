import { test, expect } from '@playwright/test';

test('depuis l’accueil : génère un QR à partir d’un texte', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Générateur de QR code/i }).click();
  await expect(page).toHaveURL(/#\/qr-generator$/);

  // Tant que le formulaire est vide, l'aperçu affiche l'invite.
  await expect(page.getByText(/Remplissez le formulaire/i)).toBeVisible();

  await page.getByLabel('Texte', { exact: true }).fill('https://exemple.com');

  // Le QR est généré (image accessible) et l'export PNG devient disponible.
  await expect(page.getByRole('img', { name: /QR code généré/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Télécharger PNG/i })).toBeEnabled();
});

test('change de type (WiFi) et personnalise la forme', async ({ page }) => {
  await page.goto('/#/qr-generator');

  await page.getByRole('radio', { name: /WiFi/i }).click();
  await page.getByLabel(/Nom du réseau/i).fill('MonReseau');
  await expect(page.getByRole('img', { name: /QR code généré/i })).toBeVisible();

  // La section « Forme des modules » permet de choisir « Points ».
  await page.getByRole('button', { name: /Forme des modules/i }).click();
  await page.getByRole('button', { name: 'Points', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Points', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
