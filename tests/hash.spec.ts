import { test, expect } from '@playwright/test';

// Empreintes connues de « abc ».
const MD5_ABC = '900150983cd24fb0d6963f7d28e17f72';
const SHA256_ABC = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';

test('depuis l’accueil, ouvre l’outil et hache un texte', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Hash \/ Checksum/i }).click();
  await expect(page).toHaveURL(/#\/hash-checksum$/);

  await page.getByLabel('Texte').fill('abc');
  await expect(page.getByText(MD5_ABC)).toBeVisible();
  await expect(page.getByText(SHA256_ABC)).toBeVisible();
});

test('vérifie la correspondance d’un hash attendu', async ({ page }) => {
  await page.goto('/#/hash-checksum');
  await page.getByLabel('Texte').fill('abc');

  // Casse différente : la normalisation doit quand même reconnaître le MD5.
  await page.getByLabel('Hash attendu').fill(MD5_ABC.toUpperCase());
  await expect(page.getByText(/Correspond à\s*MD5/)).toBeVisible();

  await page.getByLabel('Hash attendu').fill('deadbeef');
  await expect(page.getByText('Aucune correspondance')).toBeVisible();
});

test('hache un fichier sélectionné', async ({ page }) => {
  await page.goto('/#/hash-checksum');
  await page.setInputFiles('#hash-file', {
    name: 'abc.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('abc'),
  });
  await expect(page.getByText(MD5_ABC)).toBeVisible();
});
