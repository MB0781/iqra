/**
 * Moment d'accueil : la première lettre, lue en dix secondes.
 * Un succès immédiat, avant même de commencer le parcours.
 */
import { useState } from 'react';
import { lien } from '../../lib/liens';

const OPTIONS = [
  { son: 't', juste: false },
  { son: 'b', juste: true },
];

export default function PremiereLettre() {
  const [choix, setChoix] = useState<string | null>(null);
  const juste = OPTIONS.find((o) => o.son === choix)?.juste;
  return (
    <div className="relative rounded-[var(--radius-lg)] border border-trait bg-surface p-6 shadow-2 sm:p-8" data-essai="premiere-lettre">
      <p className="text-sm text-encre-2">Essaie, sans rien savoir :</p>
      <div className="mt-2 flex items-end justify-center gap-6">
        <span lang="ar" dir="rtl" className="font-arabe text-[7.5rem] leading-[1.3] text-encre sm:text-[9rem]" aria-describedby="indice-ba">
          ب
        </span>
      </div>
      <p id="indice-ba" className="text-center text-encre-2">
        Cette lettre a <strong className="text-encre">un point en dessous</strong>.<br />
        Son voisin ت en a deux au-dessus et se lit « t ».
      </p>
      <p className="mt-6 font-semibold">Alors, quel son ?</p>
      <div className="mt-3 grid grid-cols-2 gap-3" role="group" aria-label="Choisis le son">
        {OPTIONS.map((o) => {
          const etat = choix === null ? '' : o.juste ? 'border-accent bg-accent-doux' : o.son === choix ? 'border-erreur bg-erreur-doux' : 'opacity-60';
          return (
            <button key={o.son} type="button" disabled={choix !== null} onClick={() => setChoix(o.son)} className={`min-h-14 rounded-[var(--radius-md)] border-2 border-trait-fort bg-surface text-2xl font-semibold transition-colors duration-150 ${etat}`} data-option={o.son}>
              « {o.son} »
            </button>
          );
        })}
      </div>
      <div role="status" aria-live="polite" className="min-h-[5.5rem]">
        {choix !== null ? (
          <div className="mt-4">
            <p className="font-semibold">{juste ? 'Exactement : ب se lit « b ».' : 'Presque : un point en dessous, c’est ب, « b ».'}</p>
            <p className="text-encre-2">Tu viens de déchiffrer ta première lettre. Il en reste vingt-sept, par familles de même dessin.</p>
            <a className="bouton bouton-principal mt-4" href={lien('commencer/')} data-action="commencer">
              Commencer la première leçon
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
