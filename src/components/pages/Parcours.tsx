/** Carte du parcours : 9 étapes, leçons et test, avec l'état de chaque élément. */
import { useEffect, useState } from 'react';
import { Check, Lock, Circle, CircleDot } from 'lucide-react';
import { depot } from '../../lib/progression/depot';
import { etapeDebloquee, etapeValidee, leconDebloquee, prochaineLecon, type LeconRef } from '../../lib/progression/regles';
import type { EtatEtape, EtatLecon } from '../../lib/progression/types';
import { lien } from '../../lib/liens';

interface EtapeVue {
  numero: number;
  titre: string;
  objectif: string;
  palier?: string;
  aTest: boolean;
  lecons: (LeconRef & { titre: string; duree: number })[];
}

export default function Parcours({ etapes }: { etapes: EtapeVue[] }) {
  const [lecons, setLecons] = useState<EtatLecon[]>([]);
  const [etats, setEtats] = useState<EtatEtape[]>([]);
  const [pret, setPret] = useState(false);
  const toutes = etapes.flatMap((e) => e.lecons);

  useEffect(() => {
    depot()
      .then((d) => d.toutLire())
      .then((t) => {
        setLecons(t.lecons);
        setEtats(t.etapes);
      })
      .finally(() => setPret(true));
  }, []);

  const prochaine = pret ? prochaineLecon(toutes, lecons, etats) : null;

  return (
    <ol className="space-y-12">
      {etapes.map((e) => {
        const ouverte = etapeDebloquee(e.numero, etats);
        const validee = etapeValidee(e.numero, etats);
        const meilleur = etats.find((x) => x.etape === e.numero)?.meilleurScore;
        return (
          <li key={e.numero} id={`etape-${e.numero}`} className="scroll-mt-20" data-etape={e.numero} data-etat={validee ? 'validee' : ouverte ? 'ouverte' : 'fermee'}>
            <div className="grid gap-4 md:grid-cols-[14rem_1fr] md:gap-10">
              <header>
                <p className="text-sm tabular-nums text-encre-3">Étape {e.numero}</p>
                <h2 className="mt-0.5 text-xl font-semibold">{e.titre}</h2>
                <p className="mt-1 text-sm text-encre-2">{e.objectif}</p>
                {validee ? (
                  <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                    <Check aria-hidden size={16} /> Validée{meilleur ? ` (${Math.round(meilleur * 100)} %)` : ''}
                  </p>
                ) : !ouverte && pret ? (
                  <p className="mt-2 inline-flex items-center gap-1 text-sm text-encre-3">
                    <Lock aria-hidden size={14} /> S’ouvre après le test de l’étape {e.numero - 1}
                  </p>
                ) : null}
              </header>
              <ul className="divide-y divide-trait overflow-hidden rounded-[var(--radius-lg)] border border-trait bg-surface">
                {e.lecons.map((l) => {
                  const faite = lecons.some((x) => x.lecon === l.id && x.reussie);
                  const dispo = !pret || leconDebloquee(l, toutes, lecons, etats);
                  const estProchaine = prochaine?.id === l.id;
                  const Icone = faite ? Check : estProchaine ? CircleDot : dispo ? Circle : Lock;
                  const contenu = (
                    <>
                      <Icone aria-hidden size={18} className={`shrink-0 ${faite || estProchaine ? 'text-accent' : 'text-encre-3'}`} />
                      <span className="flex-1">
                        <span className={`block ${estProchaine ? 'font-semibold' : ''}`}>{l.titre}</span>
                        <span className="text-xs text-encre-3">
                          {l.duree} min{faite ? ', validée' : estProchaine ? ', à faire maintenant' : !dispo ? ', fermée' : ''}
                        </span>
                      </span>
                    </>
                  );
                  return (
                    <li key={l.id} data-lecon={l.id} data-faite={faite ? '' : undefined}>
                      {dispo ? (
                        <a href={lien(`lecon/${l.id}/`)} className={`flex min-h-14 items-center gap-3 px-4 py-3 no-underline hover:bg-surface-2 ${estProchaine ? 'bg-accent-doux' : ''}`}>
                          {contenu}
                        </a>
                      ) : (
                        <span className="flex min-h-14 items-center gap-3 px-4 py-3 text-encre-3">{contenu}</span>
                      )}
                    </li>
                  );
                })}
                {e.aTest ? (
                  <li>
                    {ouverte ? (
                      <a href={lien(`test/${e.numero}/`)} className="flex min-h-14 items-center gap-3 px-4 py-3 no-underline hover:bg-surface-2" data-test-etape={e.numero}>
                        <span aria-hidden className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 border-accent text-[10px] font-bold text-accent">
                          T
                        </span>
                        <span className="flex-1">
                          <span className="block font-semibold">Test de fin d’étape</span>
                          <span className="text-xs text-encre-3">85 % pour ouvrir l’étape suivante</span>
                        </span>
                      </a>
                    ) : (
                      <span className="flex min-h-14 items-center gap-3 px-4 py-3 text-encre-3">
                        <Lock aria-hidden size={18} className="shrink-0" />
                        Test de fin d’étape
                      </span>
                    )}
                  </li>
                ) : null}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
