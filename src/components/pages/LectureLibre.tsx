/** Lecture libre d'une sourate entière, avec les aides par défaut des réglages. */
import { useEffect, useState } from 'react';
import type { Item } from '../../contenus/types';
import { depot } from '../../lib/progression/depot';
import { estMaitrise } from '../../lib/progression/revision';
import LectureGuidee from '../exercices/LectureGuidee';

export default function LectureLibre({ sourate, nbVersets, items }: { sourate: number; nbVersets: number; items: Record<string, Item> }) {
  const [aides, setAides] = useState<('espacement' | 'voyelles' | 'syllabes' | 'audio')[] | null>(null);
  const [maitrises, setMaitrises] = useState<string[]>([]);
  const [cle, setCle] = useState(0);

  useEffect(() => {
    depot()
      .then(async (d) => {
        const r = await d.reglages();
        const t = await d.toutLire();
        setMaitrises(t.cartes.filter(estMaitrise).map((c) => c.element));
        setAides([...(Object.entries(r.aidesParDefaut).filter(([, v]) => v).map(([k]) => k) as ('espacement' | 'voyelles' | 'syllabes')[]), 'audio']);
      })
      .catch(() => setAides(['voyelles', 'audio']));
  }, []);

  // On attend les réglages : sinon l'arrivée des aides enregistrées remettrait la lecture à zéro.
  if (aides === null) return <p className="text-encre-2">Préparation de la lecture…</p>;

  const ex = {
    id: `lecture-${sourate}`,
    type: 'lecture-guidee' as const,
    versets: `${sourate}:1-${nbVersets}`,
    aides,
    explication: 'Relis demain sans les aides : c’est la meilleure façon de vérifier ce qui est acquis.',
  };
  return (
    <div key={cle}>
      <LectureGuidee ex={ex} items={items} maitrises={maitrises} onFini={() => setCle(cle + 1)} />
    </div>
  );
}
