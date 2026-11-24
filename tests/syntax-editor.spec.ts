import { expect, test } from '@playwright/test';

test('ouvre l’éditeur Prism à la largeur standard avec coloration et numéros de ligne', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.goto('/');
  const main = page.getByRole('main');
  const standardWidth = await main.evaluate((element) => getComputedStyle(element).width);
  await page.getByRole('link', { name: /Éditeur Prism/ }).click();
  await expect(page).toHaveURL(/#\/syntax-editor$/);

  const field = page.getByRole('textbox', { name: 'Code' });
  await page.getByLabel('Langage').selectOption('python');
  await field.fill('def greet():\n    return "bonjour"\n');
  await expect(page.locator('.syntax-editor .token.keyword').first()).toHaveText('def');
  await expect(page.locator('.syntax-editor-numbers')).toHaveText('1 2 3');
  await expect(main).toHaveCSS('width', standardWidth);
});

test('suit le thème de l’application et restaure un thème personnalisé enregistré', async ({
  page,
}) => {
  await page.goto('/#/syntax-editor');
  const field = page.getByRole('textbox', { name: 'Code' });
  const theme = page.getByLabel('Thème Prism');
  const editor = page.locator('.syntax-editor');
  await field.fill('const ready = true;');
  const lightBackground = await editor.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await page.getByRole('button', { name: 'Activer le mode sombre' }).click();
  await expect(editor).not.toHaveCSS('background-color', lightBackground);
  await theme.selectOption('okaidia');
  await expect(editor).toHaveCSS('background-color', 'rgb(39, 40, 34)');

  await theme.selectOption('custom');
  await expect(editor).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.getByLabel('Fond', { exact: true }).fill('#101b2c');
  await page.getByLabel('Mots-clés').fill('#aaccee');
  await expect(editor).toHaveCSS('background-color', 'rgb(16, 27, 44)');
  await expect(editor.locator('.token.keyword')).toHaveCSS('color', 'rgb(170, 204, 238)');
  await page.getByLabel('Conserver en cache').check();

  await page.reload();
  await expect(theme).toHaveValue('custom');
  await expect(field).toHaveValue('const ready = true;');
  await expect(page.getByLabel('Fond', { exact: true })).toHaveValue('#101b2c');
  await page.getByRole('button', { name: 'Réinitialiser les couleurs' }).click();
  await expect(editor).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});

test('synchronise les numéros et la coloration pendant le défilement', async ({ page }) => {
  await page.goto('/#/syntax-editor');
  const field = page.getByRole('textbox', { name: 'Code' });
  const text = Array.from(
    { length: 80 },
    (_, index) => `const a${index} = "${'x'.repeat(500)}";`,
  ).join('\n');
  await field.fill(text);
  const overlay = page.locator('.syntax-editor-highlight code');
  await expect(overlay).toBeVisible();
  await field.evaluate((element) => {
    element.scrollTop = 240;
    element.scrollLeft = 150;
  });
  await expect(page.locator('.syntax-editor-numbers')).toHaveText(/^11\s+12\s+/);
  await expect(overlay).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -150, -240)');
  await expect(field).toHaveValue(text);
});

test('copie le code complet en PNG avec le fond et les couleurs du thème', async ({
  context,
  page,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/#/syntax-editor');
  const copy = page.getByRole('button', { name: 'Copier en image' });
  await expect(copy).toBeDisabled();
  await page.getByLabel('Thème Prism').selectOption('custom');
  const field = page.getByRole('textbox', { name: 'Code' });
  const source = Array.from({ length: 40 }, (_, index) => `const line${index} = ${index};`).join(
    '\n',
  );
  await field.fill(source);
  await expect(page.locator('.syntax-editor .token.keyword').first()).toHaveText('const');
  await field.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await copy.click();
  await expect(page.getByRole('button', { name: 'Image copiée' })).toBeVisible();

  const image = await page.evaluate(async () => {
    const clipboard = await navigator.clipboard.read();
    const item = clipboard.find((entry) => entry.types.includes('image/png'));
    if (!item) throw new Error('Missing PNG');
    const bitmap = await createImageBitmap(await item.getType('image/png'));
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d')!;
    context.drawImage(bitmap, 0, 0);
    const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
    const hasBlue = pixels.some((red, index) => index % 4 === 0 && pixels[index + 2] > red + 20);
    return {
      height: bitmap.height,
      background: [...context.getImageData(bitmap.width - 1, 0, 1, 1).data],
      hasBlue,
    };
  });

  expect(image.background).toEqual([255, 255, 255, 255]);
  expect(image.hasBlue).toBe(true);
  expect(image.height).toBeGreaterThan(await field.evaluate((element) => element.clientHeight));
});

test('télécharge le PNG si le presse-papiers est inaccessible', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', { value: undefined }),
  );
  await page.goto('/#/syntax-editor');
  await page.getByRole('textbox', { name: 'Code' }).fill('const value = true;');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Copier en image' }).click();

  expect((await download).suggestedFilename()).toBe('devtoolbox-code.png');
  await expect(page.getByRole('button', { name: 'PNG téléchargé' })).toBeVisible();
});

test('colore aussi le champ existant du linter et suit le langage choisi', async ({ page }) => {
  await page.goto('/#/code-linter');
  const field = page.getByLabel('Code', { exact: true });
  await page.getByLabel('Langage').selectOption('json');
  await field.fill('{"answer": true}');
  await expect(page.locator('.syntax-editor .token.property')).toHaveText('"answer"');
  await page.getByLabel('Langage').selectOption('python');
  await field.fill('return True');
  await expect(page.locator('.syntax-editor .token.keyword')).toHaveText('return');
});

test('charge Prism hors ligne après la première visite', async ({ context, page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.getByRole('link', { name: /Éditeur Prism/ }).click();
  await page.getByRole('textbox', { name: 'Code' }).fill('const offline = true;');
  await expect(page.locator('.syntax-editor .token.keyword')).toHaveText('const');
});
