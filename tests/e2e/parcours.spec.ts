import { expect, test } from '@playwright/test';
import { faireLecon, leconsEtape, repondre, testEtape } from './outils';

test.describe.configure({ mode: 'serial' });

test('parcours complet : étape 1, de la première leçon au test de fin d’étape', async ({ page }) => {
  test.setTimeout(600_000);
  const lecons = leconsEtape(1);

  // Premier usage : la question d'accueil mène à la première leçon.
  await page.goto('commencer/');
  await page.locator('[data-reponse="non"]').click();
  await expect(page).toHaveURL(/lecon\/e1-l01\//);

  // La deuxième leçon est fermée tant que la première n'est pas validée.
  await page.goto(`lecon/${lecons[1].id}/`);
  await expect(page.locator('[data-etat="verrouillee"]')).toBeVisible();

  // Un mini-test raté ne valide pas la leçon.
  await faireLecon(page, lecons[0], { echouerTest: true });
  await expect(page.locator('[data-bilan="a-revoir"]')).toBeVisible();

  for (const l of lecons) {
    await faireLecon(page, l);
    await expect(page.locator('[data-bilan="reussi"]')).toBeVisible();
  }
  await expect(page.locator('[data-action="test-etape"]')).toBeVisible();

  // L'étape 2 est encore fermée.
  await page.goto('parcours/');
  await expect(page.locator('[data-etape="2"]')).toHaveAttribute('data-etat', 'fermee');

  // Test de fin d'étape : réussi à 100 %.
  const t = testEtape(1);
  await page.goto('test/1/');
  await page.locator('[data-action="commencer-test-etape"]').click();
  for (let i = 0; i < t.questions.length; i++) await repondre(page, t.questions);
  await expect(page.locator('[data-bilan="reussi"]')).toBeVisible();
  await expect(page.getByText('100 %')).toBeVisible();

  // L'étape 2 est maintenant ouverte, avec sa première leçon accessible.
  await page.goto('parcours/');
  await expect(page.locator('[data-etape="1"]')).toHaveAttribute('data-etat', 'validee');
  await expect(page.locator('[data-etape="2"]')).toHaveAttribute('data-etat', 'ouverte');
  await expect(page.locator('[data-etape="2"] a[href*="lecon/e2-l01"]')).toBeVisible();

  // Les lettres apprises sont en révision.
  await page.goto('tableau-de-bord/');
  await expect(page.getByText('leçons validées sur')).toBeVisible();
  await expect(page.locator('dd').nth(1)).toHaveText(String(lecons.length));
});

test('test de fin d’étape échoué sous 85 % : l’étape suivante reste fermée', async ({ page }) => {
  test.setTimeout(300_000);
  const t = testEtape(1);
  await page.goto('test/1/');
  await page.locator('[data-action="commencer-test-etape"]').click();
  // 3 erreurs sur 18 questions : 83 %, sous le seuil.
  for (let i = 0; i < t.questions.length; i++) await repondre(page, t.questions, { faux: i < 3 });
  await expect(page.locator('[data-bilan="a-revoir"]')).toBeVisible();
  await page.goto('parcours/');
  await expect(page.locator('[data-etape="2"]')).toHaveAttribute('data-etat', 'fermee');
});
