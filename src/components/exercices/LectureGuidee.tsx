/**
 * Lecture guidée de versets : aides activables puis retirées.
 * Principe : on lit d'abord seul, on écoute ensuite.
 */
import { useState } from 'react';
import { Switch } from 'radix-ui';
import { ChevronDown } from 'lucide-react';
import type { Exercice } from '../../contenus/schema';
import type { Item } from '../../contenus/types';
import type { Evaluation } from '../../lib/progression/revision';
import TexteArabe from '../arabe/TexteArabe';
import BoutonAudio from '../ui/BoutonAudio';
import { useAudio } from '../ui/useAudio';
import { CONSIGNES } from './outils';
import TexteMixte from '../ui/TexteMixte';
import type { ResultatExercice } from './Exercice';
import { AutoEvaluation, SCORE_EVAL } from './Exercice';

type Ex = Extract<Exercice, { type: 'lecture-guidee' }>;

interface Props {
  ex: Ex;
  items: Record<string, Item>;
  onFini: (r: ResultatExercice) => void;
  maitrises?: string[];
}

const LIBELLES = {
  espacement: 'Espacer les lettres',
  voyelles: 'Colorer les voyelles',
  syllabes: 'Découper en syllabes',
  audio: 'Écoute après lecture',
} as const;

type NomAide = keyof typeof LIBELLES;

export function Interrupteur({ id, libelle, actif, onChange }: { id: string; libelle: string; actif: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm text-encre">
        {libelle}
      </label>
      <Switch.Root
        id={id}
        checked={actif}
        onCheckedChange={onChange}
        className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-encre-3 bg-surface transition-colors duration-200 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
      >
        <Switch.Thumb className="block h-4 w-4 translate-x-1 rounded-full bg-encre-3 transition-transform duration-200 data-[state=checked]:translate-x-6 data-[state=checked]:bg-sur-accent" />
      </Switch.Root>
    </div>
  );
}

function MotAudio({ contenu, url, libelle }: { contenu: React.ReactNode; url: string | null; libelle: string }) {
  const { jouer } = useAudio(url);
  if (!url) return <>{contenu}</>;
  return (
    <button type="button" onClick={() => jouer()} className="rounded-[var(--radius-sm)] hover:bg-accent-doux" aria-label={`Écouter le mot ${libelle}`}>
      {contenu}
    </button>
  );
}

export function versetsDe(ex: Ex): string[] {
  const [s, plage] = ex.versets.split(':');
  const [a1, a2] = plage.split('-').map(Number);
  return Array.from({ length: (a2 ?? a1) - a1 + 1 }, (_, i) => `q:${s}:${a1 + i}`);
}

export default function LectureGuidee({ ex, items, onFini, maitrises = [] }: Props) {
  const [aides, setAides] = useState<Record<NomAide, boolean>>({
    espacement: ex.aides.includes('espacement'),
    voyelles: ex.aides.includes('voyelles'),
    syllabes: ex.aides.includes('syllabes'),
    audio: ex.aides.includes('audio'),
  });
  const [phase, setPhase] = useState<'lire' | 'ecouter' | 'fini'>('lire');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const refs = versetsDe(ex);
  const maitrisesSet = new Set(maitrises);

  return (
    <div>
      <h2 className="text-lg font-semibold">
        <TexteMixte texte={ex.consigne ?? CONSIGNES['lecture-guidee']} />
      </h2>
      <details className="aides mt-4 rounded-[var(--radius-md)] border border-trait bg-surface-2/60 px-4 py-2" open={ex.aides.length > 0}>
        <summary className="flex min-h-11 cursor-pointer items-center justify-between text-sm font-semibold">
          Aides à la lecture
          <ChevronDown aria-hidden size={18} className="chevron text-encre-2 transition-transform duration-150" />
        </summary>
        <div className="divide-y divide-trait pb-2">
          {(Object.keys(LIBELLES) as NomAide[]).map((a) => (
            <Interrupteur key={a} id={`${ex.id}-${a}`} libelle={LIBELLES[a]} actif={aides[a]} onChange={(v) => setAides({ ...aides, [a]: v })} />
          ))}
        </div>
        <p className="pb-2 text-xs text-encre-3">Retire une aide dès que tu peux t’en passer. Les mots soulignés en pointillé sont déjà maîtrisés.</p>
      </details>

      <ol className="mt-6 space-y-6">
        {refs.map((r) => {
          const it = items[r];
          const [, s, a] = r.split(':');
          const maitrisesVerset = new Set(
            (it.mots ?? []).map((_, i) => i).filter((i) => maitrisesSet.has(`q-${s}-${a}-${i + 1}`)),
          );
          return (
            <li key={r} className="flex flex-col gap-2">
              <div className="flex items-start gap-3" dir="rtl">
                <span className="mt-4 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-trait-fort text-xs tabular-nums text-encre-2" aria-label={`Verset ${a}`}>
                  {a}
                </span>
                <TexteArabe
                  as="p"
                  className="flex-1"
                  texte={it.ar}
                  coranRef={it.coranRef}
                  aides={aides}
                  motsMaitrises={maitrisesVerset}
                  rendreMot={
                    phase !== 'lire' && aides.audio
                      ? (contenu, i, mot) => <MotAudio contenu={contenu} url={it.mots?.[i]?.audio ?? null} libelle={mot} />
                      : undefined
                  }
                />
              </div>
              {phase !== 'lire' && aides.audio ? (
                <div className="pe-10" dir="rtl">
                  <BoutonAudio url={it.audio} libelle={`le verset ${a}`} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {phase === 'lire' ? (
        <button type="button" className="bouton bouton-principal mt-8" onClick={() => setPhase('ecouter')} data-action="j-ai-lu">
          J’ai lu seul
        </button>
      ) : evaluation === null ? (
        <>
          {aides.audio ? <p className="mt-6 text-sm text-encre-2">Écoute maintenant la récitation, puis touche un mot pour l’entendre seul.</p> : null}
          <AutoEvaluation onChoix={setEvaluation} />
        </>
      ) : (
        <div role="status" className="mt-6 rounded-[var(--radius-md)] border border-accent/40 bg-accent-doux p-4">
          <p className="text-encre-2">
            <TexteMixte texte={ex.explication} />
          </p>
          <button
            type="button"
            className="bouton bouton-principal mt-4"
            data-action="continuer"
            onClick={() => onFini({ score: SCORE_EVAL[evaluation], evaluation, reponses: refs.map((r) => ({ element: items[r].id, correct: evaluation !== 'faux' })) })}
          >
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}
