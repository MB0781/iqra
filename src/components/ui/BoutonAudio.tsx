import { Volume2, Snail, LoaderCircle } from 'lucide-react';
import { useAudio } from './useAudio';

interface Props {
  url: string | null;
  /** Ce qu'on entend, pour les lecteurs d'écran. */
  libelle: string;
  taille?: 'normale' | 'grande';
  lent?: boolean;
}

/**
 * Bouton d'écoute. Sans fichier audio, affiche honnêtement « audio en préparation ».
 */
export default function BoutonAudio({ url, libelle, taille = 'normale', lent = true }: Props) {
  const { jouer, etat, disponible } = useAudio(url);
  if (!disponible) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-encre-3" data-audio="absent">
        <Volume2 aria-hidden size={14} strokeWidth={1.75} />
        audio en préparation
      </span>
    );
  }
  const grand = taille === 'grande';
  return (
    <span className="inline-flex items-center gap-2" data-audio="present">
      <button
        type="button"
        className={`bouton bouton-secondaire ${grand ? 'min-h-14 px-6 text-lg' : ''}`}
        onClick={() => jouer()}
        aria-label={`Écouter ${libelle}`}
      >
        {etat === 'chargement' ? <LoaderCircle aria-hidden className="animate-spin" size={grand ? 22 : 18} /> : <Volume2 aria-hidden size={grand ? 22 : 18} strokeWidth={1.75} />}
        {grand ? 'Écouter' : null}
      </button>
      {lent ? (
        <button type="button" className="bouton bouton-discret" onClick={() => jouer(0.75)} aria-label={`Écouter ${libelle} lentement`} title="Écouter à 0,75×">
          <Snail aria-hidden size={18} strokeWidth={1.75} />
          <span className="text-sm">0,75×</span>
        </button>
      ) : null}
      {etat === 'erreur' ? <span className="text-xs text-erreur">Audio indisponible pour l'instant.</span> : null}
    </span>
  );
}
