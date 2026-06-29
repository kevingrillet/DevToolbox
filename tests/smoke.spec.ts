import { test, expect } from '@playwright/test';

/**
 * Tests de fumée du socle : la page d'accueil se charge, l'infrastructure de
 * thème fonctionne, et le routeur (hash) gère les routes inconnues + le retour.
 */
test('la page d’accueil se charge en français', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Outils', level: 1 })).toBeVisible();
  // Le registre alimente l'accueil : la carte de l'encodeur est présente.
  await expect(page.getByRole('link', { name: /Encodeur \/ Décodeur/i })).toBeVisible();
});

test('le bouton de thème bascule en mode sombre', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).not.toHaveClass(/dark/);

  await page.getByRole('button', { name: 'Activer le mode sombre' }).click();
  await expect(html).toHaveClass(/dark/);
});

test('une route inconnue affiche la 404, puis le retour ramène à l’accueil', async ({ page }) => {
  await page.goto('/#/route-inexistante');
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();

  await page.getByRole('link', { name: /Retour à l’accueil/ }).click();
  await expect(page.getByRole('heading', { name: 'Outils', level: 1 })).toBeVisible();
});
