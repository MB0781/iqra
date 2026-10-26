import { Lightbulb, TriangleAlert } from 'lucide-react';
import type { Bloc } from '../../contenus/schema';
import type { Item } from '../../contenus/types';
import TexteArabe from '../arabe/TexteArabe';
import BoutonAudio from '../ui/BoutonAudio';
import TexteRiche from '../ui/TexteRiche';

function Carte({ it, note }: { it: Item; note?: string }) {
  return (
    <div className="grid gap-2 rounded-[var(--radius-lg)] border border-trait bg-surface px-4 py-5 sm:grid-cols-[8.5rem_1fr] sm:items-center sm:gap-6">
      <TexteArabe texte={it.ar} coranRef={it.coranRef} etude className="text-center" />
      <div className="flex-1">
        <p className="font-semibold">
          {it.nom ? `${it.nom}, ` : ''}«&#8239;{it.translit}&#8239;»{it.sens ? <span className="font-normal text-encre-2"> ({it.sens})</span> : null}
        </p>
        {note ? <TexteRiche texte={note} className="mt-1 text-encre-2" /> : it.prononciation ? <p className="mt-1 text-encre-2">{it.prononciation}</p> : null}
        <div className="mt-2">
          <BoutonAudio url={it.audio} libelle={it.translit} />
        </div>
      </div>
    </div>
  );
}

export default function BlocTheorie({ bloc, items }: { bloc: Bloc; items: Record<string, Item> }) {
  switch (bloc.type) {
    case 'texte':
      return <TexteRiche texte={bloc.texte} className="text-encre-2" />;
    case 'astuce':
      return (
        <div className="flex gap-3 rounded-[var(--radius-md)] bg-accent-doux p-4">
          <Lightbulb aria-hidden size={20} className="mt-0.5 shrink-0 text-accent" />
          <TexteRiche texte={bloc.texte} />
        </div>
      );
    case 'attention':
      return (
        <div className="flex gap-3 rounded-[var(--radius-md)] bg-attention-doux p-4">
          <TriangleAlert aria-hidden size={20} className="mt-0.5 shrink-0 text-attention" />
          <TexteRiche texte={bloc.texte} />
        </div>
      );
    case 'presentation':
      return <Carte it={items[bloc.element]} note={bloc.note} />;
    case 'paire':
      return (
        <div className="rounded-[var(--radius-lg)] border border-trait bg-surface p-4">
          <div className="flex items-start justify-around gap-4" dir="rtl">
            {bloc.elements.map((r) => (
              <div key={r} className="flex flex-col items-center gap-1 text-center">
                <TexteArabe texte={items[r].ar} coranRef={items[r].coranRef} etude />
                <span className="font-semibold" dir="ltr">« {items[r].translit} »</span>
                <BoutonAudio url={items[r].audio} libelle={items[r].translit} lent={false} />
              </div>
            ))}
          </div>
          <TexteRiche texte={bloc.note} className="mt-3 text-encre-2" />
        </div>
      );
    case 'galerie':
      return (
        <div>
          <ul className="flex flex-wrap justify-center gap-3" dir="rtl">
            {bloc.elements.map((r) => (
              <li key={r} className="flex min-w-20 flex-col items-center rounded-[var(--radius-md)] border border-trait bg-surface px-3 py-2">
                <TexteArabe texte={items[r].ar} coranRef={items[r].coranRef} />
                <span className="text-sm text-encre-2" dir="ltr">{items[r].translit}</span>
              </li>
            ))}
          </ul>
          {bloc.note ? <TexteRiche texte={bloc.note} className="mt-3 text-encre-2" /> : null}
        </div>
      );
  }
}
