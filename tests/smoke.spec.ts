import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

/**
 * Accessibilité automatisée (axe-core) — PATTERN RÉUTILISABLE.
 *
 * On scanne la page avec les jeux de règles WCAG 2.x A + AA et on n'échoue que
 * sur les violations `serious` / `critical` : ce seuil attrape les vrais blocages
 * (contraste, nom accessible, ARIA cassé) sans transformer chaque avertissement
 * mineur en test rouge. `analyze()` renvoie toutes les violations ; on filtre par
 * `impact`. Pour un nouvel outil : dupliquer ce test, adapter le `goto`.
 */
async function scanSeriousA11yViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
}

test("l'accueil n'a pas de violation a11y sérieuse/critique (clair)", async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Outils', level: 1 })).toBeVisible();
  expect(await scanSeriousA11yViolations(page)).toEqual([]);
});

test("l'accueil n'a pas de violation a11y sérieuse/critique (sombre)", async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Activer le mode sombre' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(await scanSeriousA11yViolations(page)).toEqual([]);
});
