/** Mise en forme minimale des textes pédagogiques : paragraphes, **gras**, arabe isolé, typographie française. */
import { Fragment } from 'react';
import TexteMixte from './TexteMixte';

export default function TexteRiche({ texte, className = '' }: { texte: string; className?: string }) {
  return (
    <div className={className}>
      {texte.split(/\n{2,}/).map((para, i) => (
        <p key={i} className={i > 0 ? 'mt-3' : ''}>
          {para.split(/(\*\*[^*]+\*\*)/).map((m, j) =>
            m.startsWith('**') && m.endsWith('**') ? (
              <strong key={j} className="font-semibold text-encre">
                <TexteMixte texte={m.slice(2, -2)} />
              </strong>
            ) : (
              <Fragment key={j}>
                <TexteMixte texte={m} />
              </Fragment>
            ),
          )}
        </p>
      ))}
    </div>
  );
}
