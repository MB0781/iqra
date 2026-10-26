/** Exercice de démonstration (page /design) : recommence après la réponse. */
import { useState } from 'react';
import type { Exercice } from '../../contenus/schema';
import type { Item } from '../../contenus/types';
import ExerciceVue from './Exercice';

export default function DemoExercice({ ex, items }: { ex: Exercice; items: Record<string, Item> }) {
  const [n, setN] = useState(0);
  return <ExerciceVue key={n} ex={ex} items={items} onFini={() => setN(n + 1)} />;
}
