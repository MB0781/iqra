import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const PAGES = [
  '',
  'commencer/',
  'parcours/',
  'lecon/e1-l01/',
  'lecon/e4-l02/',
  'lecon/e8-l01/',
  'test/1/',
  'revision/',
  'alphabet/',
  'lecture/',
  'lecture/1/',
  'tableau-de-bord/',
  'methode/',
  'sources/',
  'confidentialite/',
  'reglages/',
  'design/',
  'studio/',
  'nexiste-pas/',
];

async function auditer(page: Page, contexte: string) {
  // Conversion : @axe-core/playwright embarque ses propres types Playwright (même API à l'exécution).
  const res = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'] }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  const graves = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const resume = graves.map((v) => `${v.id} (${v.impact}) : ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(resume, `violations graves sur ${contexte}`).toEqual([]);
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`axe-core, thème ${theme === 'light' ? 'clair' : 'sombre'}`, () => {
    test.use({ colorScheme: theme });
    for (const p of PAGES) {
      test(`/${p}`, async ({ page }) => {
        await page.goto(p);
        await page.waitForLoadState('load');
        await page.waitForTimeout(300);
        await auditer(page, `/${p} (${theme})`);
      });
    }
  });
}

test('axe-core pendant un exercice et après une réponse', async ({ page }) => {
  await page.goto('lecon/e1-l01/');
  await page.locator('[data-action="commencer-pratique"]').click();
  await auditer(page, 'exercice');
  await page.locator('[data-option]').first().click();
  await auditer(page, 'retour après réponse');
});

test('axe-core en lecture guidée avec toutes les aides', async ({ page }) => {
  await page.goto('lecture/1/');
  for (const a of ['espacement', 'syllabes']) await page.locator(`#lecture-1-${a}`).click();
  await page.locator('[data-action="j-ai-lu"]').click();
  await auditer(page, 'lecture guidée');
});

test('navigation complète au clavier : de l’accueil à la première réponse', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium');
  await page.goto('');
  // Le lien d'évitement est le premier élément atteint.
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Aller au contenu');
  // Atteindre « Commencer gratuitement » au clavier.
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    if ((await page.locator(':focus').textContent())?.includes('Commencer gratuitement')) break;
  }
  await expect(page.locator(':focus')).toHaveText('Commencer gratuitement');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/commencer\//);
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    if ((await page.locator(':focus').getAttribute('data-reponse')) === 'non') break;
  }
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/lecon\/e1-l01\//);
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    if ((await page.locator(':focus').getAttribute('data-action')) === 'commencer-pratique') break;
  }
  await page.keyboard.press('Enter');
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    if (await page.locator(':focus').getAttribute('data-option')) break;
  }
  await page.keyboard.press('Enter');
  // Après la réponse, le focus est placé sur « Continuer ».
  await expect(page.locator(':focus')).toHaveAttribute('data-action', 'continuer');
  await page.keyboard.press('Enter');
  await expect(page.getByText('2 / ')).toBeVisible();
});

test('aucune barre de défilement horizontale', async ({ page }) => {
  for (const p of PAGES) {
    await page.goto(p);
    const deborde = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(deborde, `débordement horizontal sur /${p}`).toBe(false);
  }
});
