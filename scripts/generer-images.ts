/** Génère les icônes PWA et l'image de partage (public/og.png) avec Chromium. */
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const police = readFileSync(join(process.cwd(), 'node_modules/@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-600-normal.woff2')).toString('base64');
const css = `@font-face{font-family:Naskh;src:url(data:font/woff2;base64,${police}) format('woff2');font-weight:600}
*{margin:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}`;
const marque = (c: string, t: number) => `<svg width="${t}" height="${t}" viewBox="0 0 32 32" fill="none"><rect x="7" y="7" width="18" height="18" rx="1.5" stroke="${c}" stroke-width="1.75"/><rect x="7" y="7" width="18" height="18" rx="1.5" stroke="${c}" stroke-width="1.75" transform="rotate(45 16 16)"/><circle cx="16" cy="16" r="2.25" fill="${c}"/></svg>`;

const navigateur = await chromium.launch();
const page = await navigateur.newPage();

async function icone(taille: number, fichier: string, marge: number) {
  await page.setViewportSize({ width: taille, height: taille });
  await page.setContent(`<style>${css}</style><div style="width:${taille}px;height:${taille}px;background:#2e3a2f;display:grid;place-items:center">${marque('#d9c9b2', Math.round(taille * (1 - marge)))}</div>`);
  await page.screenshot({ path: join('public/icones', fichier) });
}
await icone(192, 'icone-192.png', 0.3);
await icone(512, 'icone-512.png', 0.3);
await icone(512, 'icone-maskable-512.png', 0.45);
await icone(180, 'apple-touch-icon.png', 0.3);

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<style>${css}</style>
<div style="width:1200px;height:630px;background:#2e3a2f;color:#f8f6ee;display:grid;grid-template-columns:1fr 460px;align-items:center;padding:0 80px;gap:40px">
  <div>
    <div style="display:flex;align-items:center;gap:14px;font-size:34px;font-weight:600">${marque('#d9c9b2', 44)} Iqra’</div>
    <div style="margin-top:36px;font-size:60px;line-height:1.08;font-weight:600;letter-spacing:-0.02em">Lire l’arabe, lettre après lettre, jusqu’à lire Al‑Fatiha seul.</div>
    <div style="margin-top:28px;font-size:26px;color:#d9c9b2">Gratuit, sans publicité, sans compte.</div>
  </div>
  <div style="height:460px;border-radius:36px;background:#f8f6ee;color:#2e3a2f;box-shadow:0 30px 60px -30px rgb(0 0 0 / .5);display:grid;place-items:center">
    <div lang="ar" dir="rtl" style="font-family:Naskh;font-weight:600;font-size:250px;line-height:1">ب</div>
    <div style="font-size:26px;color:#9c4f2e;margin-top:-30px">un point en dessous : « b »</div>
  </div>
</div>`);
await page.waitForTimeout(300);
await page.screenshot({ path: 'public/og.png' });
await navigateur.close();
console.log('Images générées.');
