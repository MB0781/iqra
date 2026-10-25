/** Tableau de bord : jours actifs, éléments maîtrisés, confusions, prochaine étape, sauvegarde. */
import { useEffect, useRef, useState } from 'react';
import { AlertDialog } from 'radix-ui';
import { Download, Upload } from 'lucide-react';
import type { Item } from '../../content/types';
import { depot } from '../../lib/progression/depot';
import { estMaitrise, principalesConfusions } from '../../lib/progression/revision';
import { prochaineLecon, etapeCourante, type LeconRef } from '../../lib/progression/regles';
import type { Donnees } from '../../lib/progression/types';
import { lien } from '../../lib/liens';
import TexteArabe from '../arabe/TexteArabe';

interface Props {
  lecons: (LeconRef & { titre: string })[];
  etapes: { numero: number; titre: string }[];
}

export default function TableauDeBord({ lecons, etapes }: Props) {
  const [d, setD] = useState<Donnees | null>(null);
  const [cat, setCat] = useState<Record<string, Item>>({});
  const [message, setMessage] = useState('');
  const [aImporter, setAImporter] = useState<string | null>(null);
  const fichier = useRef<HTMLInputElement>(null);

  async function charger() {
    const dep = await depot();
    setD(await dep.toutLire());
  }

  useEffect(() => {
    charger().catch(() => setMessage('La progression n’a pas pu être lue dans ce navigateur.'));
    fetch(lien('catalogue.json'))
      .then((r) => r.json())
      .then(setCat)
      .catch(() => {});
  }, []);

  async function exporter() {
    const json = await (await depot()).exporter();
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `iqra-progression-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Sauvegarde téléchargée.');
  }

  async function confirmerImport() {
    if (!aImporter) return;
    try {
      await (await depot()).importer(aImporter);
      await charger();
      setMessage('Progression importée.');
    } catch (e) {
      setMessage((e as Error).message);
    }
    setAImporter(null);
  }

  if (!d) return <p className="text-encre-2">{message || 'Chargement…'}</p>;

  const jours = new Set(d.reponses.map((r) => r.seance)).size;
  const maitrises = d.cartes.filter(estMaitrise).length;
  const confusions = principalesConfusions(d.confusions, 5);
  const suivante = prochaineLecon(lecons, d.lecons, d.etapes);
  const courante = etapeCourante(etapes.length, d.etapes);
  const leconsFaites = d.lecons.filter((l) => l.reussie).length;

  return (
    <div className="space-y-12">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-trait bg-trait sm:grid-cols-4">
        {[
          { v: jours, l: jours > 1 ? 'jours actifs' : 'jour actif' },
          { v: leconsFaites, l: `leçons validées sur ${lecons.length}` },
          { v: maitrises, l: `éléments maîtrisés sur ${d.cartes.length} en révision` },
          { v: courante, l: `étape en cours sur ${etapes.length}` },
        ].map((s) => (
          <div key={s.l} className="flex flex-col-reverse bg-surface p-4">
            <dt className="text-sm text-encre-2">{s.l}</dt>
            <dd className="text-3xl font-semibold tabular-nums">{s.v}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="tb-suite">
        <h2 id="tb-suite" className="text-xl font-semibold">
          Prochaine étape
        </h2>
        {suivante ? (
          <p className="mt-2">
            <a className="lien" href={lien(`lecon/${suivante.id}/`)}>
              {lecons.find((l) => l.id === suivante.id)?.titre}
            </a>{' '}
            <span className="text-encre-2">(étape {suivante.etape})</span>
          </p>
        ) : (
          <p className="mt-2 text-encre-2">
            Leçons de l’étape terminées : passe le <a className="lien" href={lien(`test/${courante}/`)}>test de l’étape {courante}</a>.
          </p>
        )}
      </section>

      <section aria-labelledby="tb-conf">
        <h2 id="tb-conf" className="text-xl font-semibold">
          Confusions principales
        </h2>
        {confusions.length === 0 ? (
          <p className="mt-2 text-encre-2">Aucune confusion enregistrée pour l’instant.</p>
        ) : (
          <ul className="mt-3 divide-y divide-trait rounded-[var(--radius-md)] border border-trait bg-surface">
            {confusions.map((c) => (
              <li key={c.cle} className="flex items-center justify-between gap-4 px-4 py-2">
                <span className="flex items-center gap-3">
                  {cat[c.cible] ? <TexteArabe texte={cat[c.cible].ar} className="!text-[1.75rem]" /> : c.cible}
                  <span className="text-sm text-encre-3">pris pour</span>
                  {cat[c.choisi] ? <TexteArabe texte={cat[c.choisi].ar} className="!text-[1.75rem]" /> : c.choisi}
                </span>
                <span className="text-sm tabular-nums text-encre-2">{c.n} fois</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-sm text-encre-3">Ces paires reviennent en priorité dans la révision du jour.</p>
      </section>

      <section aria-labelledby="tb-sauv">
        <h2 id="tb-sauv" className="text-xl font-semibold">
          Sauvegarder ou transférer
        </h2>
        <p className="mt-1 text-encre-2">Ta progression n’existe que dans ce navigateur. Télécharge-la pour la garder ou la reprendre sur un autre appareil.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button type="button" className="bouton bouton-secondaire" onClick={exporter} data-action="exporter">
            <Download aria-hidden size={18} /> Télécharger ma progression
          </button>
          <button type="button" className="bouton bouton-secondaire" onClick={() => fichier.current?.click()} data-action="importer">
            <Upload aria-hidden size={18} /> Importer une sauvegarde
          </button>
          <input
            ref={fichier}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            data-champ="import"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setAImporter(await f.text());
              e.target.value = '';
            }}
          />
        </div>
        <p role="status" aria-live="polite" className="mt-3 min-h-6 text-sm text-encre-2">
          {message}
        </p>
      </section>

      <AlertDialog.Root open={aImporter !== null} onOpenChange={(o) => !o && setAImporter(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-encre/40" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] bg-surface p-6 shadow-2">
            <AlertDialog.Title className="text-lg font-semibold">Remplacer la progression ?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-encre-2">La progression actuelle de ce navigateur sera remplacée par celle du fichier.</AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel className="bouton bouton-secondaire">Annuler</AlertDialog.Cancel>
              <AlertDialog.Action className="bouton bouton-principal" onClick={confirmerImport} data-action="confirmer-import">
                Remplacer
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
