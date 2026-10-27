/** Construit un lien interne en tenant compte du préfixe de publication (/iqra/). */
export function lien(chemin = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const c = chemin.replace(/^\//, '');
  return base + c;
}
