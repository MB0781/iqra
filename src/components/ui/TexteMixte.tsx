/**
 * Texte français pouvant contenir de l'arabe (lettres, syllabes citées dans une phrase).
 * - Chaque passage arabe est isolé (lang="ar", dir="rtl", insécable, 1,4 em) ;
 * - la typographie française est appliquée au texte latin : espaces fines insécables, apostrophes courbes.
 * Jamais utilisé pour le texte coranique (qui passe par TexteArabe et data-q).
 */
import { Fragment } from 'react';

const ARABE = '\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF\\u200D';
const RE_ARABE = new RegExp(`([${ARABE}]+(?:[ \\u00A0]+[${ARABE}]+)*)`, 'g');
const EST_ARABE = new RegExp(`^[${ARABE}]`);

const FINE = ' ';
const INSECABLE = ' ';

/** Typographie française, appliquée seulement au texte latin. */
export function typo(s: string): string {
  return s
    .replace(/(\p{L})'(?=\p{L})/gu, '$1’')
    .replace(/^'|(\s)'/gu, '$1’')
    .replace(/« +/g, `«${FINE}`)
    .replace(/ +»/g, `${FINE}»`)
    .replace(/ +([;:!?%])/g, `${FINE}$1`)
    .replace(/(\d) +(%|min\b|minutes?\b)/g, `$1${INSECABLE}$2`)
    .replace(/(^|\s)(étape|leçon|Étape|Leçon|verset|versets|sourate) +(\d)/gu, `$1$2${INSECABLE}$3`);
}

export function segments(texte: string): { arabe: boolean; t: string }[] {
  return texte
    .split(RE_ARABE)
    .filter((t) => t !== '')
    .map((t) => ({ arabe: EST_ARABE.test(t), t }));
}

const RE_CITATION = /\[\[(\d+:\d+:\d+-\d+)\|([^\]]+)\]\]/;

export default function TexteMixte({ texte }: { texte: string }) {
  // Citations coraniques résolues depuis Tanzil à la construction : [[S:A:W1-W2|texte]]
  const morceaux = texte.split(new RegExp(RE_CITATION.source, 'g'));
  if (morceaux.length > 1) {
    const res = [];
    for (let i = 0; i < morceaux.length; i += 3) {
      if (morceaux[i]) res.push(<TexteMixte key={i} texte={morceaux[i]} />);
      if (morceaux[i + 1]) {
        res.push(
          <span key={`q${i}`} lang="ar" dir="rtl" className="ar-inline" data-coran="" data-q={morceaux[i + 1]}>
            {morceaux[i + 2]}
          </span>,
        );
      }
    }
    return <>{res}</>;
  }
  return (
    <>
      {segments(texte).map((s, i) =>
        s.arabe ? (
          <span key={i} lang="ar" dir="rtl" className="ar-inline">
            {s.t}
          </span>
        ) : (
          <Fragment key={i}>{typo(s.t)}</Fragment>
        ),
      )}
    </>
  );
}
