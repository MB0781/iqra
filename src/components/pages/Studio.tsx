/**
 * Studio d'enregistrement (page cachée) : le récitateur enregistre chaque élément
 * « à enregistrer » du manifeste, réécoute, recommence, puis télécharge un ZIP
 * dont les fichiers portent les identifiants du manifeste.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { zipSync } from 'fflate';
import { Mic, Square, Play, RotateCcw, Download } from 'lucide-react';
import type { ManifesteEntree } from '../../contenus/types';
import { lien } from '../../lib/liens';

interface Prise {
  blob: Blob;
  url: string;
  ext: string;
}

function extension(type: string): string {
  if (type.includes('webm')) return 'webm';
  if (type.includes('ogg')) return 'ogg';
  if (type.includes('mp4') || type.includes('aac')) return 'm4a';
  return 'webm';
}

export default function Studio() {
  const [entrees, setEntrees] = useState<ManifesteEntree[]>([]);
  const [filtre, setFiltre] = useState('');
  const [prises, setPrises] = useState<Record<string, Prise>>({});
  const [enCours, setEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState('');
  const recorder = useRef<MediaRecorder | null>(null);
  const flux = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetch(lien('manifeste-audio.json'))
      .then((r) => r.json())
      .then((m: { elements: ManifesteEntree[] }) => setEntrees(m.elements.filter((e) => e.statut === 'à enregistrer')))
      .catch(() => setErreur('Le manifeste audio n’a pas pu être chargé.'));
    return () => flux.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const visibles = useMemo(() => {
    const f = filtre.trim().toLowerCase();
    return f ? entrees.filter((e) => e.id.includes(f) || e.translit.toLowerCase().includes(f) || e.ar.includes(filtre.trim())) : entrees;
  }, [entrees, filtre]);

  async function demarrer(id: string) {
    setErreur('');
    try {
      if (!flux.current) flux.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const rec = new MediaRecorder(flux.current);
      const morceaux: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && morceaux.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(morceaux, { type: rec.mimeType });
        setPrises((p) => {
          if (p[id]) URL.revokeObjectURL(p[id].url);
          return { ...p, [id]: { blob, url: URL.createObjectURL(blob), ext: extension(rec.mimeType) } };
        });
        setEnCours(null);
      };
      recorder.current = rec;
      rec.start();
      setEnCours(id);
    } catch {
      setErreur('Micro inaccessible. Autorise le micro dans le navigateur (cadenas à côté de l’adresse), puis réessaie.');
    }
  }

  function arreter() {
    recorder.current?.stop();
  }

  function telecharger() {
    const fichiers: Record<string, Uint8Array> = {};
    Promise.all(
      Object.entries(prises).map(async ([id, p]) => {
        fichiers[`${id}.${p.ext}`] = new Uint8Array(await p.blob.arrayBuffer());
      }),
    ).then(() => {
      const zip = zipSync(fichiers, { level: 0 });
      const url = URL.createObjectURL(new Blob([zip.slice().buffer as ArrayBuffer], { type: 'application/zip' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `iqra-enregistrements-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const nb = Object.keys(prises).length;
  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 border-b border-trait bg-papier/95 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm tabular-nums">
          <strong>{nb}</strong> enregistré{nb > 1 ? 's' : ''} sur {entrees.length} à enregistrer
        </p>
        <div className="flex gap-3">
          <label className="sr-only" htmlFor="filtre">
            Filtrer
          </label>
          <input id="filtre" type="search" placeholder="Filtrer (id, son, arabe)" value={filtre} onChange={(e) => setFiltre(e.target.value)} className="min-h-11 flex-1 rounded-[var(--radius-md)] border border-trait-fort bg-surface px-3" />
          <button type="button" className="bouton bouton-principal" disabled={nb === 0} onClick={telecharger} data-action="zip">
            <Download aria-hidden size={18} /> ZIP
          </button>
        </div>
      </div>
      {erreur ? (
        <p role="alert" className="mt-4 rounded-[var(--radius-md)] bg-erreur-doux p-3 text-sm">
          {erreur}
        </p>
      ) : null}
      <ul className="mt-4 divide-y divide-trait">
        {visibles.slice(0, 300).map((e) => {
          const p = prises[e.id];
          const actif = enCours === e.id;
          return (
            <li key={e.id} className="flex flex-wrap items-center gap-4 py-3" data-studio={e.id}>
              <span lang="ar" dir="rtl" className="ar min-w-20 text-center !text-[2rem]">
                {e.ar}
              </span>
              <span className="flex-1">
                <span className="block font-semibold">« {e.translit} »</span>
                <code className="text-xs text-encre-3">{e.id}</code>
              </span>
              <span className="flex gap-2">
                {actif ? (
                  <button type="button" className="bouton bouton-principal" onClick={arreter} aria-label={`Arrêter l’enregistrement de ${e.translit}`}>
                    <Square aria-hidden size={16} /> Arrêter
                  </button>
                ) : (
                  <button type="button" className="bouton bouton-secondaire" disabled={enCours !== null} onClick={() => demarrer(e.id)} aria-label={`${p ? 'Recommencer' : 'Enregistrer'} ${e.translit}`}>
                    {p ? <RotateCcw aria-hidden size={16} /> : <Mic aria-hidden size={16} />} {p ? 'Refaire' : 'Enregistrer'}
                  </button>
                )}
                {p ? (
                  <button type="button" className="bouton bouton-discret" onClick={() => new Audio(p.url).play()} aria-label={`Réécouter ${e.translit}`}>
                    <Play aria-hidden size={16} /> Réécouter
                  </button>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
      {visibles.length > 300 ? <p className="mt-4 text-sm text-encre-2">Affine le filtre pour voir les {visibles.length - 300} autres éléments.</p> : null}
    </div>
  );
}
