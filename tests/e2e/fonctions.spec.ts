import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { faireLecon, leconsEtape, repondre } from './outils';

test('révision : les éléments d’une leçon validée reviennent, export puis import', async ({ page }) => {
  test.setTimeout(180_000);
  const [l1] = leconsEtape(1);
  await page.goto('revision/');
  await expect(page.locator('[data-revision="vide"]')).toBeVisible();
  await faireLecon(page, l1);
  await page.goto('revision/');
  await expect(page.locator('[data-exercice-id]')).toBeVisible();
  // Export de la progression
  await page.goto('tableau-de-bord/');
  const [telechargement] = await Promise.all([page.waitForEvent('download'), page.locator('[data-action="exporter"]').click()]);
  const json = readFileSync((await telechargement.path())!, 'utf-8');
  expect(JSON.parse(json)).toMatchObject({ application: 'iqra', version: 1 });
  expect(json).toContain(l1.id);
  // Import dans un navigateur vierge
  const autre = await page.context().browser()!.newContext();
  const p2 = await autre.newPage();
  await p2.goto(page.url());
  await p2.locator('[data-champ="import"]').setInputFiles({ name: 'sauvegarde.json', mimeType: 'application/json', buffer: Buffer.from(json) });
  await p2.locator('[data-action="confirmer-import"]').click();
  await expect(p2.getByText('Progression importée.')).toBeVisible();
  await expect(p2.locator('dd').nth(1)).toHaveText('1');
  await autre.close();
});

test('une erreur répétée crée une confusion visible au tableau de bord', async ({ page }) => {
  const [l1] = leconsEtape(1);
  await page.goto(`lecon/${l1.id}/`);
  await page.locator('[data-action="commencer-pratique"]').click();
  await repondre(page, l1.pratique, { faux: true });
  await repondre(page, l1.pratique, { faux: true });
  await page.goto('tableau-de-bord/');
  await expect(page.getByText('pris pour').first()).toBeVisible();
});

test('réglages : thème sombre et taille du texte arabe conservés', async ({ page }) => {
  await page.goto('reglages/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0); // page interactive
  await page.getByRole('radio', { name: 'Sombre' }).click();
  await page.getByRole('radio', { name: 'Très grande' }).click();
  await page.goto('alphabet/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'sombre');
  await expect(page.locator('html')).toHaveAttribute('data-taille-ar', 'tres-grande');
});

test('lecture guidée : lire d’abord, écouter ensuite', async ({ page }) => {
  await page.goto('lecture/112/');
  await expect(page.locator('[data-action="j-ai-lu"]')).toBeVisible();
  await expect(page.locator('[data-q]').first()).toBeVisible();
  await expect(page.locator('[data-audio="present"]')).toHaveCount(0);
  await page.locator('[data-action="j-ai-lu"]').click();
  await expect(page.locator('[data-audio="present"]').first()).toBeVisible();
});

test('studio : liste des éléments à enregistrer', async ({ page }) => {
  await page.goto('studio/');
  await expect(page.locator('[data-studio]').first()).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('validation des sons : 28 lettres, choix conservé et résultat exportable', async ({ page }) => {
  await page.goto('studio/sources/');
  await expect(page.locator('[data-lettre]')).toHaveCount(28);
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  const ba = page.locator('[data-lettre="lettre-ba"]');
  await ba.locator('label', { hasText: 'Bapron' }).click();
  await expect(page.getByText('1').first()).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-lettre="lettre-ba"] input:checked')).toHaveCount(1);
  const lien = await page.getByRole('link', { name: 'Télécharger' }).getAttribute('href');
  expect(decodeURIComponent(lien!)).toContain('"lettre-ba": "Bapron.wav"');
});

test('alphabet : exactement les 28 lettres', async ({ page }) => {
  await page.goto('alphabet/');
  await expect(page.locator('tbody tr')).toHaveCount(28);
});

test('page 404', async ({ page }) => {
  const r = await page.goto('cette-page-n-existe-pas/');
  expect(r?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Cette page n’existe pas' })).toBeVisible();
});
