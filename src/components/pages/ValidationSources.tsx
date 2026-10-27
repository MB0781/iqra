/**
 * Validation à l'écoute des enregistrements libres (Wikimedia Commons) avant de les utiliser.
 * Pour chaque lettre : écouter les candidats, choisir celui qui dit le bon nom, ou « aucun ».
 * Le résultat (JSON) est à transmettre pour intégration : rien n'est utilisé sans validation humaine.
 */
import { useEffect, useState } from 'react';
import { Play, Copy, Download } from 'lucide-react';

interface Lettre {
  id: string;
  ar: string;
  nom: string;
  candidats: string[];
}

const CLE = 'iqra:validation-sources';

export default function ValidationSources({ lettres, urls }: { lettres: Lettre[]; urls: Record<string, string> }) {
  const [choix, setChoix] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const s = localStorage.getItem(CLE);
      if (s) setChoix(JSON.parse(s));
    } catch {
      // brouillon indisponible
    }
  }, []);

  function choisir(id: string, v: string) {
    const n = { ...choix, [id]: v };
    setChoix(n);
    try {
      localStorage.setItem(CLE, JSON.stringify(n));
    } catch {
      // ignoré
    }
  }

  const fait = lettres.filter((l) => choix[l.id]).length;
  const resultat = JSON.stringify({ valide: choix, date: new Date().toISOString().slice(0, 10) }, null, 1);

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-trait bg-papier/95 px-4 py-3 backdrop-blur-sm">
        <p className="text-sm tabular-nums">
          <strong>{fait}</strong> lettres sur {lettres.length} décidées
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="bouton bouton-secondaire"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(resultat);
                setMessage('Résultat copié : colle-le dans la conversation avec Claude.');
              } catch {
                setMessage('Copie impossible : utilise « Télécharger ».');
              }
            }}
          >
            <Copy aria-hidden size={16} /> Copier le résultat
          </button>
          <a className="bouton bouton-principal" href={`data:application/json;charset=utf-8,${encodeURIComponent(resultat)}`} download="validation-audio.json">
            <Download aria-hidden size={16} /> Télécharger
          </a>
        </div>
        <p role="status" className="w-full text-sm text-encre-2 empty:hidden">
          {message}
        </p>
      </div>
      <ol className="mt-4 divide-y divide-trait">
        {lettres.map((l) => (
          <li key={l.id} className="py-4" data-lettre={l.id}>
            <fieldset>
              <legend className="flex items-center gap-4">
                <span lang="ar" dir="rtl" className="ar w-12 text-center !text-[2.25rem]">
                  {l.ar}
                </span>
                <span>
                  <span className="block font-semibold">On doit entendre : « {l.nom} »</span>
                  <span className="text-sm text-encre-2">Choisis le fichier qui dit ce nom, clairement et sans bruit.</span>
                </span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {l.candidats.map((f) => (
                  <label key={f} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border-2 border-trait-fort bg-surface px-3 has-[:checked]:border-accent has-[:checked]:bg-accent-doux has-[:focus-visible]:shadow-[var(--focus)]">
                    <input type="radio" className="sr-only" name={l.id} checked={choix[l.id] === f} onChange={() => choisir(l.id, f)} />
                    <button type="button" className="rounded-full p-1 hover:bg-accent-doux" onClick={() => new Audio(urls[f]).play()} aria-label={`Écouter ${f}`}>
                      <Play aria-hidden size={16} />
                    </button>
                    <span className="text-sm">{f.replace('.wav', '')}</span>
                  </label>
                ))}
                <label className="flex min-h-11 cursor-pointer items-center rounded-[var(--radius-md)] border-2 border-trait-fort bg-surface px-3 text-sm has-[:checked]:border-erreur has-[:checked]:bg-erreur-doux">
                  <input type="radio" className="sr-only" name={l.id} checked={choix[l.id] === 'aucun'} onChange={() => choisir(l.id, 'aucun')} />
                  Aucun ne convient
                </label>
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
    </div>
  );
}
