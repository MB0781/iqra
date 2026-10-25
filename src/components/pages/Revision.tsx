/**
 * Révision du jour : confusions ciblées, puis cartes dues (5 minutes maximum).
 */
import { useEffect, useState } from 'react';
import type { Exercice } from '../../content/schema';
import type { Item } from '../../content/types';
import { depot } from '../../lib/progression/depot';
import { cartesDues, principalesConfusions, proposerRetour, MAX_REVISION } from '../../lib/progression/revision';
import { etapeCourante } from '../../lib/progression/regles';
import { lien } from '../../lib/liens';
import { melanger } from '../exercices/outils';
import Seance from '../exercices/Seance';

export function construireRevision(
  catalogue: Record<string, Item>,
  dues: { element: string }[],
  confusions: { cible: string; choisi: string }[],
  graine: string,
): Exercice[] {
  const exos: Exercice[] = [];
  for (const [i, c] of confusions.slice(0, 3).entries()) {
    const a = catalogue[c.cible];
    const b = catalogue[c.choisi];
    if (!a || !b || a.translit === b.translit) continue;
    exos.push({
      id: `confusion-${i}`,
      type: 'paires-minimales',
      paire: [a.id, b.id],
      cible: a.id,
      consigne: 'Tu as déjà confondu ces deux-là. Lequel est-ce ?',
      explication: `« ${a.translit} » et « ${b.translit} » se ressemblent. ${a.prononciation ?? ''}`.trim(),
    });
  }
  for (const d of dues) {
    const it = catalogue[d.element];
    if (!it) continue;
    const lecture = it.coran || it.type === 'mot' || it.type === 'expression' || !it.translit;
    if (lecture) {
      exos.push({ id: `rev-${it.id}`, type: 'lis-verifie', cible: it.id, explication: `Référence : « ${it.translit} ».` });
      continue;
    }
    const confondus = confusions.filter((c) => c.cible === it.id).map((c) => c.choisi);
    const memeType = Object.values(catalogue).filter((x) => x.type === it.type && x.id !== it.id && x.translit !== it.translit && !x.coran);
    const distracteurs = [...new Set([...confondus.filter((x) => catalogue[x]), ...melanger(memeType, graine + it.id).map((x) => x.id)])]
      .filter((x) => catalogue[x].translit !== it.translit)
      .slice(0, 2);
    if (distracteurs.length === 0) {
      exos.push({ id: `rev-${it.id}`, type: 'lis-verifie', cible: it.id, explication: `Référence : « ${it.translit} ».` });
      continue;
    }
    exos.push({
      id: `rev-${it.id}`,
      type: 'lis-choisis-son',
      cible: it.id,
      options: [it.id, ...distracteurs],
      explication: `C’est « ${it.translit} ».${it.prononciation ? ` ${it.prononciation}` : ''}`,
    });
  }
  return exos;
}

export default function Revision({ etapesTotal }: { etapesTotal: number }) {
  const [etat, setEtat] = useState<'chargement' | 'vide' | 'pret' | 'fini' | 'erreur'>('chargement');
  const [exos, setExos] = useState<Exercice[]>([]);
  const [catalogue, setCatalogue] = useState<Record<string, Item>>({});
  const [retour, setRetour] = useState(false);
  const [etape, setEtape] = useState(1);
  const [score, setScore] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [cat, d] = await Promise.all([fetch(lien('catalogue.json')).then((r) => r.json() as Promise<Record<string, Item>>), depot()]);
        const t = await d.toutLire();
        setCatalogue(cat);
        setRetour(proposerRetour(t.seances));
        setEtape(etapeCourante(etapesTotal, t.etapes));
        const dues = cartesDues(t.cartes, new Date(), MAX_REVISION);
        const e = construireRevision(cat, dues, principalesConfusions(t.confusions), d.seance);
        setExos(e);
        setEtat(e.length ? 'pret' : 'vide');
      } catch {
        setEtat('erreur');
      }
    })();
  }, [etapesTotal]);

  return (
    <div>
      {retour ? (
        <div className="mb-8 rounded-[var(--radius-md)] border border-attention/40 bg-attention-doux p-4" data-alerte="retour">
          <p className="font-semibold">Les trois dernières révisions sont sous 70 %.</p>
          <p className="mt-1 text-sm">
            Ce n’est pas un échec : c’est le signe qu’une base mérite d’être consolidée. Tu peux reprendre l’étape {Math.max(1, etape - 1)} avant de continuer.{' '}
            <a className="lien" href={lien(`parcours/#etape-${Math.max(1, etape - 1)}`)}>
              Revoir l’étape {Math.max(1, etape - 1)}
            </a>
          </p>
        </div>
      ) : null}
      {etat === 'chargement' ? <p className="text-encre-2">Préparation de ta révision…</p> : null}
      {etat === 'erreur' ? <p className="text-erreur">La révision n’a pas pu se charger. Vérifie ta connexion puis recharge la page.</p> : null}
      {etat === 'vide' ? (
        <div data-revision="vide">
          <p className="text-lg">Rien à revoir pour l’instant.</p>
          <p className="mt-1 text-encre-2">Les éléments des leçons validées reviennent ici au moment où tu risques de les oublier.</p>
          <a className="bouton bouton-principal mt-6" href={lien('parcours/')}>
            Continuer le parcours
          </a>
        </div>
      ) : null}
      {etat === 'pret' ? (
        <Seance
          exercices={exos}
          items={catalogue}
          contexte="revision"
          lecon={null}
          titre="Révision du jour"
          onTermine={(s) => {
            setScore(s);
            setEtat('fini');
          }}
          onResultat={async (ex, r) => {
            const d = await depot();
            const cible = 'cible' in ex ? ex.cible : null;
            if (cible && ex.id.startsWith('rev-')) await d.evaluer(cible, r.evaluation ?? (r.score >= 1 ? 'juste' : 'faux'));
          }}
        />
      ) : null}
      {etat === 'fini' ? (
        <section data-revision="fini">
          <h2 className="text-2xl font-semibold">Révision terminée</h2>
          <p className="mt-2 text-lg tabular-nums">
            Réussite : <strong>{Math.round(score * 100)} %</strong>
          </p>
          <a className="bouton bouton-principal mt-6" href={lien('parcours/')}>
            Continuer le parcours
          </a>
        </section>
      ) : null}
    </div>
  );
}
