/** Outils des tests navigateur : lire les contenus et répondre juste à chaque exercice. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page } from '@playwright/test';

type Ex = Record<string, unknown> & { id: string; type: string };
export interface Lecon { id: string; etape: number; ordre: number; pratique: Ex[]; test: Ex[] }

const RACINE = join(process.cwd(), 'src', 'contenus', 'lecons');

export function leconsEtape(n: number): Lecon[] {
  const d = join(RACINE, `etape-${n}`);
  return readdirSync(d)
    .filter((f) => /^e\d-l\d+\.json$/.test(f))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(d, f), 'utf-8')) as Lecon);
}

export function testEtape(n: number): { questions: Ex[] } {
  return JSON.parse(readFileSync(join(RACINE, `etape-${n}`, 'test-etape.json'), 'utf-8'));
}

/** Répond à l'exercice affiché (juste, ou faux si demandé), puis continue. */
export async function repondre(page: Page, exos: Ex[], { faux = false } = {}) {
  const zone = page.locator('[data-exercice-id]');
  await expect(zone).toBeVisible();
  const id = await zone.getAttribute('data-exercice-id');
  const ex = exos.find((e) => e.id === id)!;
  expect(ex, `exercice ${id} introuvable`).toBeTruthy();
  switch (ex.type) {
    case 'ecoute-choisis':
    case 'lis-choisis-son':
    case 'paires-minimales': {
      const options = (ex.type === 'paires-minimales' ? ex.paire : ex.options) as string[];
      const choix = faux ? options.find((o) => o !== ex.cible)! : (ex.cible as string);
      await zone.locator(`[data-option="${choix}"]`).click();
      break;
    }
    case 'trouve-lettre': {
      const choix = faux ? (['debut', 'milieu', 'fin', 'absente'].find((o) => o !== ex.reponse) as string) : (ex.reponse as string);
      await zone.locator(`[data-option="${choix}"]`).click();
      break;
    }
    case 'assemble': {
      const morceaux = ex.morceaux as string[];
      const ordre = faux ? [...morceaux].reverse() : morceaux;
      for (const m of ordre) await zone.locator(`[data-tuile="${m}"]:not([disabled])`).first().click();
      await zone.locator('[data-action="verifier"]').click();
      break;
    }
    case 'classe': {
      const cats = (ex.categories as { id: string }[]).map((c) => c.id);
      for (const e of ex.elements as { ref: string; categorie: string }[]) {
        const cat = faux ? cats.find((c) => c !== e.categorie)! : e.categorie;
        await zone.locator('label', { has: page.locator(`input[name="${ex.id}-${e.ref}"][value="${cat}"]`) }).click();
      }
      await zone.locator('[data-action="verifier"]').click();
      break;
    }
    case 'lis-verifie':
    case 'lecture-guidee': {
      await zone.locator('[data-action="j-ai-lu"]').click();
      await zone.locator(`[data-eval="${faux ? 'faux' : 'juste'}"]`).click();
      break;
    }
  }
  await zone.locator('[data-action="continuer"]').click();
  // Attendre que l'exercice suivant (ou le bilan) remplace celui-ci.
  await expect(page.locator(`[data-exercice-id="${id}"]`)).toHaveCount(0);
}

/** Fait une leçon complète : théorie, pratique, mini-test. */
export async function faireLecon(page: Page, l: Lecon, { echouerTest = false } = {}) {
  await page.goto(`lecon/${l.id}/`);
  await page.locator('[data-action="commencer-pratique"]').click();
  for (let i = 0; i < l.pratique.length; i++) await repondre(page, l.pratique);
  await page.locator('[data-action="commencer-test"]').click();
  for (let i = 0; i < l.test.length; i++) await repondre(page, l.test, { faux: echouerTest });
  await expect(page.locator('[data-bilan]')).toBeVisible();
}
