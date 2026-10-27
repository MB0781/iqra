/** Mélange déterministe (même ordre au rendu serveur et dans le navigateur). */
export function melanger<T>(liste: T[], graine: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < graine.length; i++) h = Math.imul(h ^ graine.charCodeAt(i), 16777619);
  const alea = () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const res = [...liste];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

export const CONSIGNES: Record<string, string> = {
  'ecoute-choisis': 'Écoute, puis choisis ce que tu entends.',
  'lis-choisis-son': 'Lis, puis choisis le son.',
  'paires-minimales': 'Deux sons proches : lequel est-ce ?',
  'trouve-lettre': 'Où se trouve la lettre dans ce mot ?',
  assemble: 'Remets les morceaux dans l’ordre de lecture (de droite à gauche).',
  classe: 'Range chaque élément dans la bonne colonne.',
  'lis-verifie': 'Lis à voix haute, puis écoute la référence et évalue-toi.',
  'lecture-guidee': 'Lis d’abord seul, puis écoute.',
};
