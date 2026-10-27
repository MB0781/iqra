/** Premier usage : une seule question, puis la première leçon. */
import { useState } from 'react';
import { depot } from '../../lib/progression/depot';
import { lien } from '../../lib/liens';

export default function Accueil({ premiereLecon }: { premiereLecon: string }) {
  const [reponse, setReponse] = useState<'non' | 'oui' | null>(null);

  async function choisir(r: 'non' | 'oui') {
    setReponse(r);
    try {
      await (await depot()).definirMeta('accueil', { connaitLettres: r === 'oui', date: Date.now() });
    } catch {
      // sans stockage, le parcours fonctionne quand même
    }
    if (r === 'non') window.location.href = lien(`lecon/${premiereLecon}/`);
  }

  return (
    <div>
      <fieldset>
        <legend className="text-2xl font-semibold sm:text-3xl">Connais-tu déjà des lettres arabes ?</legend>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" className="flex min-h-24 flex-col items-start justify-center rounded-[var(--radius-lg)] border-2 border-trait-fort bg-surface p-5 text-start hover:border-accent" onClick={() => choisir('non')} data-reponse="non">
            <span className="text-lg font-semibold">Non, je pars de zéro</span>
            <span className="text-sm text-encre-2">Première leçon tout de suite : trois lettres, cinq minutes.</span>
          </button>
          <button type="button" className="flex min-h-24 flex-col items-start justify-center rounded-[var(--radius-lg)] border-2 border-trait-fort bg-surface p-5 text-start hover:border-accent" onClick={() => choisir('oui')} data-reponse="oui">
            <span className="text-lg font-semibold">Oui, quelques-unes</span>
            <span className="text-sm text-encre-2">Tu pourras valider l’étape 1 par son test, ou réviser les leçons.</span>
          </button>
        </div>
      </fieldset>
      {reponse === 'oui' ? (
        <div className="mt-8 rounded-[var(--radius-lg)] border border-trait bg-surface p-5" role="status">
          <p className="font-semibold">Deux possibilités :</p>
          <ul className="mt-3 space-y-3">
            <li>
              <a className="bouton bouton-principal" href={lien('test/1/')}>
                Passer le test de l’étape 1
              </a>
              <p className="mt-1 text-sm text-encre-2">Avec 85 %, l’étape 2 (les lettres dans un mot) s’ouvre directement.</p>
            </li>
            <li>
              <a className="bouton bouton-secondaire" href={lien(`lecon/${premiereLecon}/`)}>
                Commencer quand même par la leçon 1
              </a>
              <p className="mt-1 text-sm text-encre-2">Les leçons sont courtes : c’est le meilleur moyen de consolider les sons.</p>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
