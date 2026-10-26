/** Réglages : taille du texte arabe, vitesse audio, aides par défaut, thème. */
import { useEffect, useState } from 'react';
import { RadioGroup } from 'radix-ui';
import { depot } from '../../lib/progression/depot';
import { REGLAGES_DEFAUT, type Reglages as R } from '../../lib/progression/types';
import { Interrupteur } from '../exercices/LectureGuidee';

function Choix<T extends string>({ nom, valeur, options, onChange }: { nom: string; valeur: T; options: { v: T; label: string; extra?: React.ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <RadioGroup.Root className="mt-3 grid gap-2 sm:grid-cols-3" value={valeur} onValueChange={(v) => onChange(v as T)} aria-label={nom}>
      {options.map((o) => (
        <RadioGroup.Item
          key={o.v}
          value={o.v}
          className="flex min-h-12 flex-col items-center justify-center rounded-[var(--radius-md)] border-2 border-trait-fort bg-surface px-3 py-2 text-sm data-[state=checked]:border-accent data-[state=checked]:bg-accent-doux"
        >
          {o.extra}
          {o.label}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}

export function appliquerReglages(r: R) {
  const root = document.documentElement;
  if (r.theme === 'systeme') delete root.dataset.theme;
  else root.dataset.theme = r.theme;
  if (r.tailleArabe === 'normale') delete root.dataset.tailleAr;
  else root.dataset.tailleAr = r.tailleArabe;
  try {
    localStorage.setItem('iqra:theme', r.theme);
    localStorage.setItem('iqra:taille-ar', r.tailleArabe);
    localStorage.setItem('iqra:vitesse', String(r.vitesse));
  } catch {
    // stockage indisponible : réglage valable pour cette visite
  }
}

export default function Reglages() {
  const [r, setR] = useState<R>(REGLAGES_DEFAUT);
  const [message, setMessage] = useState('');

  useEffect(() => {
    depot().then((d) => d.reglages()).then(setR).catch(() => {});
  }, []);

  async function maj(n: R) {
    setR(n);
    appliquerReglages(n);
    try {
      await (await depot()).definirReglages(n);
      setMessage('Réglage enregistré.');
    } catch {
      setMessage('Réglage appliqué pour cette visite.');
    }
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="r-taille">
        <h2 id="r-taille" className="text-lg font-semibold">
          Taille du texte arabe
        </h2>
        <Choix
          nom="Taille du texte arabe"
          valeur={r.tailleArabe}
          onChange={(v) => maj({ ...r, tailleArabe: v })}
          options={[
            { v: 'normale', label: 'Normale', extra: <span lang="ar" dir="rtl" className="ar" style={{ fontSize: '2.25rem', lineHeight: 1.6 }}>بَ</span> },
            { v: 'grande', label: 'Grande', extra: <span lang="ar" dir="rtl" className="ar" style={{ fontSize: '2.75rem', lineHeight: 1.6 }}>بَ</span> },
            { v: 'tres-grande', label: 'Très grande', extra: <span lang="ar" dir="rtl" className="ar" style={{ fontSize: '3.25rem', lineHeight: 1.6 }}>بَ</span> },
          ]}
        />
      </section>
      <section aria-labelledby="r-vitesse">
        <h2 id="r-vitesse" className="text-lg font-semibold">
          Vitesse de l’audio
        </h2>
        <p className="mt-1 text-sm text-encre-2">Le bouton 0,75× reste disponible à côté de chaque écoute.</p>
        <Choix
          nom="Vitesse de l’audio"
          valeur={String(r.vitesse) as '1' | '0.75'}
          onChange={(v) => maj({ ...r, vitesse: v === '0.75' ? 0.75 : 1 })}
          options={[
            { v: '1', label: 'Normale (1×)' },
            { v: '0.75', label: 'Ralentie (0,75×)' },
          ]}
        />
      </section>
      <section aria-labelledby="r-aides">
        <h2 id="r-aides" className="text-lg font-semibold">
          Aides en lecture libre
        </h2>
        <p className="mt-1 text-sm text-encre-2">Aides activées à l’ouverture d’une sourate dans la page Lecture. Dans les leçons, c’est la leçon qui décide.</p>
        <div className="mt-3 divide-y divide-trait rounded-[var(--radius-md)] border border-trait bg-surface px-4">
          <Interrupteur id="r-esp" libelle="Espacer les lettres" actif={r.aidesParDefaut.espacement} onChange={(v) => maj({ ...r, aidesParDefaut: { ...r.aidesParDefaut, espacement: v } })} />
          <Interrupteur id="r-voy" libelle="Colorer les voyelles" actif={r.aidesParDefaut.voyelles} onChange={(v) => maj({ ...r, aidesParDefaut: { ...r.aidesParDefaut, voyelles: v } })} />
          <Interrupteur id="r-syl" libelle="Découper en syllabes" actif={r.aidesParDefaut.syllabes} onChange={(v) => maj({ ...r, aidesParDefaut: { ...r.aidesParDefaut, syllabes: v } })} />
        </div>
      </section>
      <section aria-labelledby="r-theme">
        <h2 id="r-theme" className="text-lg font-semibold">
          Thème
        </h2>
        <Choix
          nom="Thème"
          valeur={r.theme}
          onChange={(v) => maj({ ...r, theme: v })}
          options={[
            { v: 'systeme', label: 'Comme l’appareil' },
            { v: 'clair', label: 'Clair' },
            { v: 'sombre', label: 'Sombre' },
          ]}
        />
      </section>
      <p role="status" aria-live="polite" className="min-h-6 text-sm text-encre-2">
        {message}
      </p>
    </div>
  );
}
