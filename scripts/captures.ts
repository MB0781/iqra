/**
 * Captures d'écran de chaque page : mobile et ordinateur, clair et sombre.
 * Prérequis : `npm run build` puis `npx astro preview --port 4321` en arrière-plan.
 * Usage : npx tsx scripts/captures.ts [dossier]
 */
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dossier = process.argv[2] ?? 'docs/captures';
mkdirSync(dossier, { recursive: true });
const BASE = 'http://localhost:4321/iqra/';
const pages: [string, string][] = [
  ['accueil', ''],
  ['commencer', 'commencer/'],
  ['parcours', 'parcours/'],
  ['lecon', 'lecon/e1-l01/'],
  ['lecon-etape8', 'lecon/e8-l01/'],
  ['test-etape', 'test/1/'],
  ['revision', 'revision/'],
  ['alphabet', 'alphabet/'],
  ['lecture', 'lecture/'],
  ['lecture-fatiha', 'lecture/1/'],
  ['tableau-de-bord', 'tableau-de-bord/'],
  ['methode', 'methode/'],
  ['sources', 'sources/'],
  ['confidentialite', 'confidentialite/'],
  ['reglages', 'reglages/'],
  ['design', 'design/'],
  ['studio', 'studio/'],
  ['404', 'nexiste-pas/'],
];
const formats = [
  { nom: 'mobile', options: devices['Pixel 7'] },
  { nom: 'ordinateur', options: { viewport: { width: 1280, height: 800 } } },
];
const navigateur = await chromium.launch();
for (const f of formats) {
  for (const theme of ['light', 'dark'] as const) {
    const ctx = await navigateur.newContext({ ...f.options, colorScheme: theme, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    for (const [nom, chemin] of pages) {
      await page.goto(BASE + chemin, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(dossier, `${nom}-${f.nom}-${theme === 'light' ? 'clair' : 'sombre'}.png`), fullPage: true });
    }
    await ctx.close();
  }
}
// Exercice en cours et retour après réponse
for (const f of formats) {
  for (const theme of ['light', 'dark'] as const) {
    const ctx = await navigateur.newContext({ ...f.options, colorScheme: theme, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const suffixe = `${f.nom}-${theme === 'light' ? 'clair' : 'sombre'}`;
    await page.goto(BASE + 'lecon/e3-l01/', { waitUntil: 'load' });
    await page.locator('[data-action="commencer-pratique"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(dossier, `exercice-question-${suffixe}.png`) });
    await page.locator('[data-option]').first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(dossier, `exercice-retour-${suffixe}.png`) });
    await ctx.close();
  }
}
await navigateur.close();
console.log(`${pages.length * 4} captures dans ${dossier}`);
