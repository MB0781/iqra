/** Mise en forme minimale des textes pédagogiques : paragraphes et **gras**. */
import { Fragment } from 'react';

export default function TexteRiche({ texte, className = '' }: { texte: string; className?: string }) {
  return (
    <div className={className}>
      {texte.split(/\n{2,}/).map((para, i) => (
        <p key={i} className={i > 0 ? 'mt-3' : ''}>
          {para.split(/(\*\*[^*]+\*\*)/).map((m, j) =>
            m.startsWith('**') && m.endsWith('**') ? <strong key={j} className="font-semibold text-encre">{m.slice(2, -2)}</strong> : <Fragment key={j}>{m}</Fragment>,
          )}
        </p>
      ))}
    </div>
  );
}
