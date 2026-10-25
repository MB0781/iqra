/**
 * Déroulé d'une leçon : théorie courte → pratique active → mini-test → bilan.
 */
import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import type { Lecon as LeconT } from '../../content/schema';
import type { Item } from '../../content/types';
import { depot } from '../../lib/progression/depot';
import { leconDebloquee, SEUIL_LECON, type LeconRef } from '../../lib/progression/regles';
import { estMaitrise } from '../../lib/progression/revision';
import { lien } from '../../lib/liens';
import BlocTheorie from './BlocTheorie';
import Seance from './Seance';

interface Props {
  lecon: LeconT;
  items: Record<string, Item>;
  toutes: LeconRef[];
  suivante: { id: string; titre: string } | null;
  precedente: { id: string; titre: string } | null;
  /** Identifiants des éléments nouveaux (pour les cartes de révision). */
  nouveaux: string[];
}

type Phase = 'theorie' | 'pratique' | 'avant-test' | 'test' | 'bilan';

export default function Lecon({ lecon, items, toutes, suivante, precedente, nouveaux }: Props) {
  const [phase, setPhase] = useState<Phase>('theorie');
  const [ouverte, setOuverte] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [maitrises, setMaitrises] = useState<string[]>([]);

  useEffect(() => {
    depot()
      .then(async (d) => {
        const tout = await d.toutLire();
        setOuverte(leconDebloquee(lecon, toutes, tout.lecons, tout.etapes));
        setMaitrises(tout.cartes.filter(estMaitrise).map((c) => c.element));
      })
      .catch(() => setOuverte(true));
  }, [lecon, toutes]);

  useEffect(() => {
    if (phase !== 'theorie') document.getElementById('lecon-zone')?.scrollIntoView({ block: 'start' });
  }, [phase]);

  async function terminer(s: number) {
    setScore(s);
    try {
      await (await depot()).terminerLecon(lecon.id, s, nouveaux);
    } catch {
      // ignoré : la leçon reste utilisable sans stockage
    }
    setPhase('bilan');
  }

  return (
    <div id="lecon-zone" className="scroll-mt-20">
      {phase === 'theorie' ? (
        <section aria-labelledby="titre-theorie">
          <h2 id="titre-theorie" className="text-xl font-semibold">
            Comprendre
          </h2>
          <div className="mt-4 space-y-5">
            {lecon.theorie.map((b, i) => (
              <BlocTheorie key={i} bloc={b} items={items} />
            ))}
          </div>
          <div className="mt-8">
            {ouverte === false ? (
              <div className="flex gap-3 rounded-[var(--radius-md)] border border-trait bg-surface-2 p-4" data-etat="verrouillee">
                <Lock aria-hidden size={20} className="mt-0.5 shrink-0 text-encre-2" />
                <div>
                  <p className="font-semibold">Cette leçon s’ouvrira après la précédente.</p>
                  <p className="mt-1 text-sm text-encre-2">
                    Tu peux lire l’explication dès maintenant.{' '}
                    {precedente ? (
                      <a className="lien" href={lien(`lecon/${precedente.id}/`)}>
                        Aller à « {precedente.titre} »
                      </a>
                    ) : (
                      <a className="lien" href={lien('parcours/')}>
                        Voir le parcours
                      </a>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <button type="button" className="bouton bouton-principal w-full sm:w-auto" disabled={ouverte === null} onClick={() => setPhase('pratique')} data-action="commencer-pratique">
                M’entraîner ({lecon.pratique.length} exercices)
              </button>
            )}
          </div>
        </section>
      ) : null}

      {phase === 'pratique' ? (
        <Seance exercices={lecon.pratique} items={items} contexte="pratique" lecon={lecon.id} titre="Entraînement" maitrises={maitrises} onTermine={() => setPhase('avant-test')} />
      ) : null}

      {phase === 'avant-test' ? (
        <section className="text-center sm:text-start" aria-labelledby="titre-avant-test">
          <h2 id="titre-avant-test" className="text-xl font-semibold">
            Entraînement terminé
          </h2>
          <p className="mt-2 text-encre-2">
            Place au mini-test : {lecon.test.length} questions, sans aide. Il faut {Math.round(SEUIL_LECON * 100)} % pour valider la leçon.
          </p>
          <button type="button" className="bouton bouton-principal mt-6" onClick={() => setPhase('test')} data-action="commencer-test">
            Commencer le mini-test
          </button>
        </section>
      ) : null}

      {phase === 'test' ? <Seance exercices={lecon.test} items={items} contexte="test" lecon={lecon.id} titre="Mini-test" onTermine={terminer} /> : null}

      {phase === 'bilan' ? (
        <section aria-labelledby="titre-bilan" data-bilan={score >= SEUIL_LECON ? 'reussi' : 'a-revoir'}>
          <h2 id="titre-bilan" className="text-2xl font-semibold">
            {score >= SEUIL_LECON ? 'Leçon validée' : 'Encore un passage'}
          </h2>
          <p className="mt-2 text-lg tabular-nums">
            Mini-test : <strong>{Math.round(score * 100)} %</strong>
          </p>
          <p className="mt-2 text-encre-2">
            {score >= SEUIL_LECON
              ? 'Les éléments de cette leçon rejoignent tes révisions : ils reviendront au bon moment pour s’ancrer.'
              : `Il faut ${Math.round(SEUIL_LECON * 100)} %. Relis l’explication et refais l’entraînement : la deuxième fois va souvent beaucoup mieux.`}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {score >= SEUIL_LECON ? (
              suivante ? (
                <a className="bouton bouton-principal" href={lien(`lecon/${suivante.id}/`)} data-action="lecon-suivante">
                  Leçon suivante : {suivante.titre}
                </a>
              ) : (
                <a className="bouton bouton-principal" href={lien(`test/${lecon.etape}/`)} data-action="test-etape">
                  Passer le test de fin d’étape
                </a>
              )
            ) : (
              <button type="button" className="bouton bouton-principal" onClick={() => setPhase('theorie')}>
                Reprendre la leçon
              </button>
            )}
            <a className="bouton bouton-secondaire" href={lien('parcours/')}>
              Retour au parcours
            </a>
          </div>
        </section>
      ) : null}
    </div>
  );
}
