/** Test de fin d'étape : 85 % pour débloquer l'étape suivante. */
import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import type { Exercice } from '../../content/schema';
import type { Item } from '../../content/types';
import { depot } from '../../lib/progression/depot';
import { SEUIL_ETAPE, testEtapeDisponible, etapeTerminee, type LeconRef } from '../../lib/progression/regles';
import { lien } from '../../lib/liens';
import Seance from './Seance';

interface Props {
  etape: number;
  questions: Exercice[];
  items: Record<string, Item>;
  toutes: LeconRef[];
  aSuivante: boolean;
}

export default function TestEtape({ etape, questions, items, toutes, aSuivante }: Props) {
  const [phase, setPhase] = useState<'intro' | 'test' | 'bilan'>('intro');
  const [dispo, setDispo] = useState<boolean | null>(null);
  const [leconsFaites, setLeconsFaites] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    depot()
      .then(async (d) => {
        const t = await d.toutLire();
        setDispo(testEtapeDisponible(etape, t.etapes));
        setLeconsFaites(etapeTerminee(etape, toutes, t.lecons));
      })
      .catch(() => setDispo(true));
  }, [etape, toutes]);

  async function terminer(s: number) {
    setScore(s);
    try {
      await (await depot()).terminerTestEtape(etape, s);
    } catch {
      // ignoré
    }
    setPhase('bilan');
  }

  const reussi = score >= SEUIL_ETAPE;
  return (
    <div>
      {phase === 'intro' ? (
        <section>
          <p className="text-encre-2">
            {questions.length} questions sur des éléments que tu n’as pas encore vus en exercice, construits avec ce que tu as appris. Il faut{' '}
            {Math.round(SEUIL_ETAPE * 100)} % pour ouvrir l’étape suivante.
          </p>
          {dispo && !leconsFaites ? (
            <p className="mt-3 rounded-[var(--radius-md)] bg-attention-doux p-3 text-sm">
              Tu n’as pas terminé toutes les leçons de cette étape. Si tu connais déjà ces notions, tu peux tenter le test directement.
            </p>
          ) : null}
          {dispo === false ? (
            <div className="mt-6 flex gap-3 rounded-[var(--radius-md)] border border-trait bg-surface-2 p-4" data-etat="verrouille">
              <Lock aria-hidden size={20} className="mt-0.5 shrink-0" />
              <p>
                Ce test s’ouvre après le test de l’étape {etape - 1}.{' '}
                <a className="lien" href={lien(`test/${etape - 1}/`)}>
                  Aller au test de l’étape {etape - 1}
                </a>
              </p>
            </div>
          ) : (
            <button type="button" className="bouton bouton-principal mt-6" disabled={dispo === null} onClick={() => setPhase('test')} data-action="commencer-test-etape">
              Commencer le test
            </button>
          )}
        </section>
      ) : null}
      {phase === 'test' ? <Seance exercices={questions} items={items} contexte="test-etape" lecon={null} titre={`Test de l’étape ${etape}`} onTermine={terminer} /> : null}
      {phase === 'bilan' ? (
        <section data-bilan={reussi ? 'reussi' : 'a-revoir'} aria-labelledby="bilan-test">
          <h2 id="bilan-test" className="text-2xl font-semibold">
            {reussi ? `Étape ${etape} validée` : 'Pas encore'}
          </h2>
          <p className="mt-2 text-lg tabular-nums">
            Résultat : <strong>{Math.round(score * 100)} %</strong>
          </p>
          <p className="mt-2 text-encre-2">
            {reussi
              ? aSuivante
                ? `L’étape ${etape + 1} est ouverte.`
                : 'Tu as terminé le parcours guidé.'
              : `Il faut ${Math.round(SEUIL_ETAPE * 100)} %. Fais tes révisions du jour, puis retente le test : les questions porteront sur les mêmes notions.`}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a className="bouton bouton-principal" href={lien('parcours/')} data-action="retour-parcours">
              {reussi ? 'Voir la suite du parcours' : 'Retour au parcours'}
            </a>
            {!reussi ? (
              <a className="bouton bouton-secondaire" href={lien('revision/')}>
                Réviser
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
