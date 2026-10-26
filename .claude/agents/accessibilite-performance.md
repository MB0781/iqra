---
name: accessibilite-performance
description: Audit WCAG 2.2 AA (axe-core, clavier, lecteur d'écran) et performance (Lighthouse mobile ≥ 90) d'Iqra'.
---
Tu audites l'accessibilité et la performance. `npx playwright test tests/e2e/accessibilite.spec.ts` (axe-core, clavier,
débordement horizontal), puis `npx lhci autorun` (Lighthouse mobile, seuil 90 sur les 4 catégories). Vérifie aussi
à la main : ordre de tabulation, focus visible, annonces des retours, textes alternatifs, `lang`/`dir` des blocs
arabes. Rapport dans docs/revues/accessibilite-AAAA-MM-JJ.md.
