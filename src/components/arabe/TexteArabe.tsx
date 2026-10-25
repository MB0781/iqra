/**
 * Affiche un texte arabe, avec les aides à la lecture appliquées à l'affichage seulement.
 * Le texte source n'est jamais modifié : la concaténation du textContent reste identique
 * à la source (les ZWJ d'espacement sont ajoutés par des pseudo-éléments CSS).
 */
import type { CSSProperties, ReactNode } from 'react';
import { CLASSE_SIGNE, grappes, liaisons, syllabes, type Grappe } from '../../lib/arabe';

export interface Aides {
  espacement?: boolean;
  voyelles?: boolean;
  syllabes?: boolean;
}

interface Props {
  texte: string;
  /** « S:A:W1-W2 » si le texte vient de Tanzil. */
  coranRef?: string;
  aides?: Aides;
  etude?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Indices (0-based) des mots maîtrisés, marqués discrètement. */
  motsMaitrises?: Set<number>;
  /** Rendu personnalisé d'un mot (ex. bouton audio mot par mot). */
  rendreMot?: (contenu: ReactNode, index: number, mot: string) => ReactNode;
  as?: 'span' | 'p' | 'div';
}

function rendreGrappe(g: Grappe, voyelles: boolean): ReactNode {
  if (!voyelles || !g.signes) return g.texte;
  return (
    <>
      {g.base}
      {Array.from(g.signes).map((s, i) => (
        <span key={i} className={`s-${CLASSE_SIGNE[s] ?? 'autre'}`}>
          {s}
        </span>
      ))}
    </>
  );
}

function rendreMot(mot: string, aides: Aides): ReactNode {
  const actif = aides.espacement || aides.voyelles || aides.syllabes;
  if (!actif) return mot;
  const gs = grappes(mot);
  const li = liaisons(gs);
  const grappe = (i: number) =>
    aides.espacement ? (
      <span key={i} className="grappe" data-av={li[i].avant ? '' : undefined} data-ap={li[i].apres ? '' : undefined}>
        {rendreGrappe(gs[i], !!aides.voyelles)}
      </span>
    ) : (
      <span key={i}>{rendreGrappe(gs[i], !!aides.voyelles)}</span>
    );
  if (!aides.syllabes) return gs.map((_, i) => grappe(i));
  return syllabes(gs).map((s, k) => {
    const premier = s[0];
    const dernier = s[s.length - 1];
    return (
      <span key={k} className="syllabe" data-av={li[premier].avant ? '' : undefined} data-ap={li[dernier].apres ? '' : undefined}>
        {s.map(grappe)}
      </span>
    );
  });
}

export default function TexteArabe({ texte, coranRef, aides = {}, etude, className = '', style, motsMaitrises, rendreMot: rendu, as = 'span' }: Props) {
  const Balise = as;
  const classes = [
    'ar',
    etude ? 'ar-etude' : '',
    aides.espacement ? 'aide-espacement' : '',
    aides.voyelles ? 'aide-voyelles' : '',
    aides.syllabes ? 'aide-syllabes' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const mots = texte.split(' ');
  return (
    <Balise lang="ar" dir="rtl" className={classes} style={style} data-q={coranRef} data-coran={coranRef ? '' : undefined}>
      {mots.map((m, i) => {
        let contenu: ReactNode = rendreMot(m, aides);
        if (motsMaitrises?.has(i)) contenu = <span className="mot-maitrise">{contenu}</span>;
        if (rendu) contenu = rendu(contenu, i, m);
        return (
          <span key={i}>
            {i > 0 ? ' ' : ''}
            {contenu}
          </span>
        );
      })}
    </Balise>
  );
}
