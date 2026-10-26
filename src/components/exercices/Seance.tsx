/**
 * Enchaîne une série d'exercices, enregistre chaque réponse et calcule le score.
 */
import { useEffect, useRef, useState } from 'react';
import type { Exercice } from '../../contenus/schema';
import type { Item } from '../../contenus/types';
import type { Contexte } from '../../lib/progression/types';
import { depot } from '../../lib/progression/depot';
import ExerciceVue, { type ResultatExercice } from './Exercice';

interface Props {
  exercices: Exercice[];
  items: Record<string, Item>;
  contexte: Contexte;
  lecon: string | null;
  titre: string;
  maitrises?: string[];
  onTermine: (score: number, resultats: ResultatExercice[]) => void;
  /** Appelé pour chaque résultat (ex. révision : noter la carte). */
  onResultat?: (ex: Exercice, r: ResultatExercice) => Promise<void> | void;
}

export default function Seance({ exercices, items, contexte, lecon, titre, maitrises, onTermine, onResultat }: Props) {
  const [i, setI] = useState(0);
  const [resultats, setResultats] = useState<ResultatExercice[]>([]);
  const zone = useRef<HTMLDivElement>(null);
  const premier = useRef(true);

  useEffect(() => {
    if (premier.current) {
      premier.current = false;
      return;
    }
    zone.current?.focus();
  }, [i]);

  async function fini(r: ResultatExercice) {
    const ex = exercices[i];
    try {
      const d = await depot();
      for (const rep of r.reponses) await d.repondre({ ...rep, lecon, contexte });
      await onResultat?.(ex, r);
    } catch {
      // l'enregistrement ne doit jamais bloquer l'apprentissage
    }
    const tous = [...resultats, r];
    setResultats(tous);
    if (i + 1 >= exercices.length) {
      onTermine(tous.reduce((s, x) => s + x.score, 0) / tous.length, tous);
    } else {
      setI(i + 1);
    }
  }

  const ex = exercices[i];
  return (
    <section aria-label={titre}>
      <div className="flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-label={`${titre} : progression`}
          aria-valuemin={0}
          aria-valuemax={exercices.length}
          aria-valuenow={i}
        >
          <div className="h-full rounded-full bg-accent transition-[width] duration-250" style={{ width: `${(i / exercices.length) * 100}%` }} />
        </div>
        <span className="text-xs tabular-nums text-encre-3">
          {i + 1} / {exercices.length}
        </span>
      </div>
      <div ref={zone} tabIndex={-1} className="mt-6 outline-none" key={`${ex.id}-${i}`} data-exercice={ex.type} data-exercice-id={ex.id}>
        <ExerciceVue ex={ex} items={items} onFini={fini} maitrises={maitrises} />
      </div>
    </section>
  );
}
