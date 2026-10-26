/**
 * Tous les types d'exercices. Chaque exercice :
 * 1. affiche la question, 2. recueille la réponse, 3. montre un retour explicatif,
 * 4. appelle `onFini` avec le résultat quand l'apprenant continue.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';
import type { Exercice } from '../../contenus/schema';
import type { Item } from '../../contenus/types';
import type { Evaluation } from '../../lib/progression/revision';
import TexteArabe, { type Aides } from '../arabe/TexteArabe';
import BoutonAudio from '../ui/BoutonAudio';
import { CONSIGNES, melanger } from './outils';
import TexteMixte from '../ui/TexteMixte';
import LectureGuidee from './LectureGuidee';

export interface ReponseElement {
  element: string;
  correct: boolean;
  choisi?: string;
}

export interface ResultatExercice {
  score: number;
  reponses: ReponseElement[];
  evaluation?: Evaluation;
}

interface Props {
  ex: Exercice;
  items: Record<string, Item>;
  onFini: (r: ResultatExercice) => void;
  /** Identifiants d'éléments maîtrisés (lecture guidée). */
  maitrises?: string[];
  aidesDefaut?: Aides;
}

function Retour({ correct, explication, suite, onSuite, partiel }: { correct: boolean; explication: string; suite: string; onSuite: () => void; partiel?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div
      role="status"
      className={`mt-6 rounded-[var(--radius-md)] border p-4 ${correct ? 'border-accent/40 bg-accent-doux' : 'border-erreur/40 bg-erreur-doux'}`}
      data-retour={correct ? 'juste' : 'faux'}
    >
      <p className="flex items-center gap-2 font-semibold">
        {correct ? <Check aria-hidden size={20} className="text-accent" /> : <X aria-hidden size={20} className="text-erreur" />}
        {correct ? (partiel ? 'Presque.' : 'Juste.') : 'Pas tout à fait.'}
      </p>
      <p className="mt-1 text-encre-2">
        <TexteMixte texte={explication} />
      </p>
      <button ref={ref} type="button" className="bouton bouton-principal mt-4 w-full sm:w-auto" onClick={onSuite} data-action="continuer">
        {suite}
      </button>
    </div>
  );
}

function Consigne({ ex }: { ex: Exercice }) {
  return (
    <h2 className="text-lg font-semibold text-encre">
      <TexteMixte texte={ex.consigne ?? CONSIGNES[ex.type]} />
    </h2>
  );
}

/** Bouton d'option réutilisable. */
function Option({ children, etat, onClick, desactive, ...rest }: { children: ReactNode; etat: 'neutre' | 'juste' | 'faux' | 'attenue'; onClick: () => void; desactive: boolean; [k: string]: unknown }) {
  const styles = {
    neutre: 'border-trait-fort bg-surface hover:border-encre-3',
    juste: 'border-accent bg-accent-doux',
    faux: 'border-erreur bg-erreur-doux',
    attenue: 'border-trait bg-surface opacity-60',
  }[etat];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desactive}
      aria-pressed={etat === 'juste' || etat === 'faux' ? true : undefined}
      className={`relative flex min-h-16 w-full items-center justify-center rounded-[var(--radius-md)] border-2 px-3 py-2 transition-colors duration-150 disabled:cursor-default ${styles}`}
      {...rest}
    >
      {children}
      {etat === 'juste' ? <Check aria-label="bonne réponse" size={18} className="absolute end-2 top-2 text-accent" /> : null}
      {etat === 'faux' ? <X aria-label="ta réponse" size={18} className="absolute end-2 top-2 text-erreur" /> : null}
    </button>
  );
}

/** Indication sonore quand l'audio manque : la translittération et un conseil. */
function SonEcrit({ item }: { item: Item }) {
  return (
    <p className="text-encre-2">
      Son : <span className="font-semibold text-encre">« {item.translit} »</span>
      {item.prononciation ? <span className="block text-sm text-encre-3">{item.prononciation}</span> : null}
    </p>
  );
}

function ExChoix({ ex, items, onFini }: Props & { ex: Extract<Exercice, { type: 'ecoute-choisis' | 'lis-choisis-son' | 'paires-minimales' }> }) {
  const options = useMemo(() => melanger(ex.type === 'paires-minimales' ? [...ex.paire] : ex.options, ex.id), [ex]);
  const [choix, setChoix] = useState<string | null>(null);
  const cible = items[ex.cible];
  const montrerArabe = ex.type !== 'lis-choisis-son';
  const correct = choix === ex.cible;
  return (
    <div>
      <Consigne ex={ex} />
      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        {ex.type === 'lis-choisis-son' ? (
          <TexteArabe texte={cible.ar} coranRef={cible.coranRef} etude />
        ) : (
          <>
            <BoutonAudio url={cible.audio} libelle="le son à reconnaître" taille="grande" />
            {!cible.audio ? <SonEcrit item={cible} /> : null}
          </>
        )}
      </div>
      <div className={`mt-6 grid gap-3 ${options.length > 2 ? 'grid-cols-2' : 'grid-cols-2'}`} role="group" aria-label="Choix de réponse">
        {options.map((o) => {
          const it = items[o];
          const etat = choix === null ? 'neutre' : o === ex.cible ? 'juste' : o === choix ? 'faux' : 'attenue';
          return (
            <div key={o} className="flex flex-col items-center gap-1">
              <Option etat={etat} desactive={choix !== null} onClick={() => setChoix(o)} data-option={o}>
                {montrerArabe ? (
                  <TexteArabe texte={it.ar} coranRef={it.coranRef} />
                ) : (
                  <span className="text-xl font-semibold" lang="fr">
                    {it.translit}
                  </span>
                )}
              </Option>
              {!montrerArabe && it.audio ? <BoutonAudio url={it.audio} libelle={it.translit} lent={false} /> : null}
            </div>
          );
        })}
      </div>
      {choix !== null ? (
        <Retour
          correct={correct}
          explication={ex.explication}
          suite="Continuer"
          onSuite={() => onFini({ score: correct ? 1 : 0, reponses: [{ element: cible.id, correct, choisi: correct ? undefined : items[choix].id }] })}
        />
      ) : null}
    </div>
  );
}

const POSITIONS = [
  { id: 'debut', label: 'Au début', aide: 'à droite' },
  { id: 'milieu', label: 'Au milieu', aide: '' },
  { id: 'fin', label: 'À la fin', aide: 'à gauche' },
  { id: 'absente', label: 'Absente', aide: '' },
] as const;

function ExTrouveLettre({ ex, items, onFini }: Props & { ex: Extract<Exercice, { type: 'trouve-lettre' }> }) {
  const [choix, setChoix] = useState<string | null>(null);
  const mot = items[ex.mot];
  const lettre = items[ex.lettre];
  const correct = choix === ex.reponse;
  return (
    <div>
      <Consigne ex={ex} />
      <p className="mt-2 text-encre-2">
        Lettre cherchée : <TexteArabe texte={lettre.ar} className="!text-[2rem] align-middle" /> ({lettre.translit})
      </p>
      <div className="mt-4 flex justify-center">
        <TexteArabe texte={mot.ar} coranRef={mot.coranRef} etude />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3" role="group" aria-label="Position de la lettre">
        {POSITIONS.map((p) => {
          const etat = choix === null ? 'neutre' : p.id === ex.reponse ? 'juste' : p.id === choix ? 'faux' : 'attenue';
          return (
            <Option key={p.id} etat={etat} desactive={choix !== null} onClick={() => setChoix(p.id)} data-option={p.id}>
              <span className="flex flex-col">
                <span className="font-semibold">{p.label}</span>
                {p.aide ? <span className="text-xs text-encre-3">{p.aide}</span> : null}
              </span>
            </Option>
          );
        })}
      </div>
      {choix !== null ? (
        <Retour correct={correct} explication={ex.explication} suite="Continuer" onSuite={() => onFini({ score: correct ? 1 : 0, reponses: [{ element: lettre.id, correct }] })} />
      ) : null}
    </div>
  );
}

function ExAssemble({ ex, items, onFini }: Props & { ex: Extract<Exercice, { type: 'assemble' }> }) {
  const tuiles = useMemo(() => melanger([...ex.morceaux, ...(ex.distracteurs ?? [])].map((r, i) => ({ r, k: i })), ex.id), [ex]);
  const [rang, setRang] = useState<number[]>([]);
  const [verifie, setVerifie] = useState(false);
  const resultat = items[ex.resultat];
  const reponse = rang.map((k) => tuiles.find((t) => t.k === k)!.r);
  const correct = reponse.length === ex.morceaux.length && reponse.every((r, i) => items[r].ar === items[ex.morceaux[i]].ar);
  return (
    <div>
      <Consigne ex={ex} />
      <div
        className="mt-6 flex min-h-20 flex-wrap items-center justify-start gap-2 rounded-[var(--radius-md)] border-2 border-dashed border-trait-fort p-3"
        dir="rtl"
        aria-label="Ta réponse, de droite à gauche"
        role="group"
        data-zone="reponse"
      >
        {rang.length === 0 ? <span className="text-sm text-encre-3" dir="ltr">Touche les morceaux dans l’ordre.</span> : null}
        {rang.map((k) => {
          const t = tuiles.find((x) => x.k === k)!;
          return (
            <button key={k} type="button" disabled={verifie} className="rounded-[var(--radius-sm)] border border-accent bg-accent-doux px-3" onClick={() => setRang(rang.filter((x) => x !== k))} aria-label={`Retirer ${items[t.r].translit}`}>
              <TexteArabe texte={items[t.r].ar} coranRef={items[t.r].coranRef} />
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2" dir="rtl" role="group" aria-label="Morceaux disponibles">
        {tuiles.map((t) => {
          const pris = rang.includes(t.k);
          return (
            <button
              key={t.k}
              type="button"
              disabled={pris || verifie}
              className="min-h-14 rounded-[var(--radius-sm)] border-2 border-trait-fort bg-surface px-4 transition-opacity duration-150 disabled:opacity-30"
              onClick={() => setRang([...rang, t.k])}
              aria-label={`Ajouter ${items[t.r].translit}`}
              data-tuile={t.r}
            >
              <TexteArabe texte={items[t.r].ar} coranRef={items[t.r].coranRef} />
            </button>
          );
        })}
      </div>
      {!verifie ? (
        <div className="mt-6 flex gap-3">
          <button type="button" className="bouton bouton-principal" disabled={rang.length === 0} onClick={() => setVerifie(true)} data-action="verifier">
            Vérifier
          </button>
          <button type="button" className="bouton bouton-discret" disabled={rang.length === 0} onClick={() => setRang([])}>
            <RotateCcw aria-hidden size={16} /> Recommencer
          </button>
        </div>
      ) : (
        <>
          {!correct ? (
            <div className="mt-4 text-center">
              <p className="text-sm text-encre-2">Réponse attendue :</p>
              <TexteArabe texte={resultat.ar} coranRef={resultat.coranRef} />
            </div>
          ) : null}
          <Retour correct={correct} explication={ex.explication} suite="Continuer" onSuite={() => onFini({ score: correct ? 1 : 0, reponses: [{ element: resultat.id, correct }] })} />
        </>
      )}
    </div>
  );
}

function ExClasse({ ex, items, onFini }: Props & { ex: Extract<Exercice, { type: 'classe' }> }) {
  const elements = useMemo(() => melanger(ex.elements, ex.id), [ex]);
  const [choix, setChoix] = useState<Record<string, string>>({});
  const [verifie, setVerifie] = useState(false);
  const complet = elements.every((e) => choix[e.ref]);
  const justes = elements.filter((e) => choix[e.ref] === e.categorie).length;
  const score = justes / elements.length;
  return (
    <div>
      <Consigne ex={ex} />
      <ul className="mt-6 space-y-3">
        {elements.map((e) => {
          const it = items[e.ref];
          const juste = verifie && choix[e.ref] === e.categorie;
          return (
            <li key={e.ref} className={`flex flex-col gap-2 rounded-[var(--radius-md)] border p-3 sm:flex-row sm:items-center sm:justify-between ${verifie ? (juste ? 'border-accent bg-accent-doux' : 'border-erreur bg-erreur-doux') : 'border-trait bg-surface'}`}>
              <TexteArabe texte={it.ar} coranRef={it.coranRef} />
              <fieldset className="flex flex-wrap gap-2">
                <legend className="sr-only">Catégorie de {it.translit}</legend>
                {ex.categories.map((c) => (
                  <label key={c.id} className={`flex min-h-11 cursor-pointer items-center rounded-[var(--radius-sm)] border px-3 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-doux has-[:focus-visible]:shadow-[var(--focus)] ${verifie ? 'pointer-events-none' : ''} border-trait-fort`}>
                    <input type="radio" className="sr-only" name={`${ex.id}-${e.ref}`} value={c.id} disabled={verifie} checked={choix[e.ref] === c.id} onChange={() => setChoix({ ...choix, [e.ref]: c.id })} />
                    {c.label}
                    {verifie && c.id === e.categorie ? <Check aria-label="(bonne catégorie)" size={16} className="ms-1 text-accent" /> : null}
                  </label>
                ))}
              </fieldset>
            </li>
          );
        })}
      </ul>
      {!verifie ? (
        <button type="button" className="bouton bouton-principal mt-6" disabled={!complet} onClick={() => setVerifie(true)} data-action="verifier">
          Vérifier
        </button>
      ) : (
        <Retour
          correct={score >= 0.5}
          partiel={score < 1 && score >= 0.5}
          explication={`${justes} sur ${elements.length}. ${ex.explication}`}
          suite="Continuer"
          onSuite={() => onFini({ score, reponses: elements.map((e) => ({ element: items[e.ref].id, correct: choix[e.ref] === e.categorie })) })}
        />
      )}
    </div>
  );
}

export function AutoEvaluation({ onChoix }: { onChoix: (e: Evaluation) => void }) {
  return (
    <div className="mt-6">
      <p className="font-semibold">Comment as-tu lu ?</p>
      <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="Auto-évaluation">
        <button type="button" className="bouton bouton-secondaire" onClick={() => onChoix('juste')} data-eval="juste">
          Juste
        </button>
        <button type="button" className="bouton bouton-secondaire" onClick={() => onChoix('hesitant')} data-eval="hesitant">
          Hésitant
        </button>
        <button type="button" className="bouton bouton-secondaire" onClick={() => onChoix('faux')} data-eval="faux">
          Faux
        </button>
      </div>
      <p className="mt-2 text-xs text-encre-3">Personne ne t’écoute : sois honnête, la révision s’adapte à ta réponse.</p>
    </div>
  );
}

export const SCORE_EVAL: Record<Evaluation, number> = { juste: 1, hesitant: 0.5, faux: 0 };

function ExLisVerifie({ ex, items, onFini }: Props & { ex: Extract<Exercice, { type: 'lis-verifie' }> }) {
  const [etape, setEtape] = useState<'lire' | 'ecouter'>('lire');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const cible = items[ex.cible];
  return (
    <div>
      <Consigne ex={ex} />
      <div className="mt-6 flex justify-center">
        <TexteArabe texte={cible.ar} coranRef={cible.coranRef} etude />
      </div>
      {etape === 'lire' ? (
        <button type="button" className="bouton bouton-principal mt-6" onClick={() => setEtape('ecouter')} data-action="j-ai-lu">
          J’ai lu à voix haute
        </button>
      ) : (
        <div className="mt-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-encre-2">
              Référence : <span className="font-semibold text-encre">« {cible.translit} »</span>
            </p>
            <BoutonAudio url={cible.audio} libelle={cible.translit} />
          </div>
          {evaluation === null ? (
            <AutoEvaluation onChoix={setEvaluation} />
          ) : (
            <Retour
              correct={evaluation !== 'faux'}
              partiel={evaluation === 'hesitant'}
              explication={ex.explication}
              suite="Continuer"
              onSuite={() => onFini({ score: SCORE_EVAL[evaluation], evaluation, reponses: [{ element: cible.id, correct: evaluation !== 'faux' }] })}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function ExerciceVue(props: Props) {
  const { ex } = props;
  switch (ex.type) {
    case 'ecoute-choisis':
    case 'lis-choisis-son':
    case 'paires-minimales':
      return <ExChoix {...props} ex={ex} />;
    case 'trouve-lettre':
      return <ExTrouveLettre {...props} ex={ex} />;
    case 'assemble':
      return <ExAssemble {...props} ex={ex} />;
    case 'classe':
      return <ExClasse {...props} ex={ex} />;
    case 'lis-verifie':
      return <ExLisVerifie {...props} ex={ex} />;
    case 'lecture-guidee':
      return <LectureGuidee {...props} ex={ex} />;
  }
}
