/** Lecture audio native (élément <audio>), avec vitesse réglable et rejouer. */
import { useCallback, useEffect, useRef, useState } from 'react';

let courant: HTMLAudioElement | null = null;

export function vitesseAudio(): number {
  try {
    return localStorage.getItem('iqra:vitesse') === '0.75' ? 0.75 : 1;
  } catch {
    return 1;
  }
}

export function useAudio(url: string | null) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [etat, setEtat] = useState<'repos' | 'chargement' | 'lecture' | 'erreur'>('repos');

  useEffect(() => {
    if (!url) return;
    const a = new Audio();
    a.preload = 'auto';
    a.src = url;
    ref.current = a;
    const fin = () => setEtat('repos');
    const err = () => setEtat('erreur');
    const joue = () => setEtat('lecture');
    a.addEventListener('ended', fin);
    a.addEventListener('pause', fin);
    a.addEventListener('error', err);
    a.addEventListener('playing', joue);
    return () => {
      a.pause();
      a.removeEventListener('ended', fin);
      a.removeEventListener('pause', fin);
      a.removeEventListener('error', err);
      a.removeEventListener('playing', joue);
      ref.current = null;
    };
  }, [url]);

  const jouer = useCallback(
    async (vitesse?: number) => {
      const a = ref.current;
      if (!a) return;
      if (courant && courant !== a) courant.pause();
      courant = a;
      a.currentTime = 0;
      a.playbackRate = vitesse ?? vitesseAudio();
      setEtat('chargement');
      try {
        await a.play();
      } catch {
        setEtat('erreur');
      }
    },
    [],
  );

  return { jouer, etat, disponible: !!url };
}
