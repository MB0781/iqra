/**
 * Export / import de la progression en JSON, avec migrations versionnées.
 */
import { z } from 'zod';
import { donneesVides, type Donnees } from './types';

export const VERSION_EXPORT = 1;

const Fichier = z.object({
  application: z.literal('iqra'),
  version: z.number().int().min(1),
  exporteLe: z.string(),
  donnees: z.record(z.string(), z.array(z.unknown())),
});

/** Migrations : version N → N+1. Ajouter ici les futures transformations. */
const MIGRATIONS: Record<number, (d: Record<string, unknown[]>) => Record<string, unknown[]>> = {};

export function exporter(d: Donnees, maintenant = new Date()): string {
  return JSON.stringify({ application: 'iqra', version: VERSION_EXPORT, exporteLe: maintenant.toISOString(), donnees: d }, null, 2);
}

export class ErreurImport extends Error {}

export function importer(texte: string): Donnees {
  let brut: unknown;
  try {
    brut = JSON.parse(texte);
  } catch {
    throw new ErreurImport("Ce fichier n'est pas un fichier JSON valide.");
  }
  const r = Fichier.safeParse(brut);
  if (!r.success) throw new ErreurImport("Ce fichier ne ressemble pas à une sauvegarde d'Iqra'.");
  let { version, donnees } = r.data;
  if (version > VERSION_EXPORT) throw new ErreurImport('Cette sauvegarde vient d’une version plus récente du site. Recharge la page puis réessaie.');
  while (version < VERSION_EXPORT) {
    const m = MIGRATIONS[version];
    if (!m) throw new ErreurImport(`Aucune migration depuis la version ${version}.`);
    donnees = m(donnees);
    version++;
  }
  const vide = donneesVides();
  const res = { ...vide } as Donnees;
  for (const k of Object.keys(vide) as (keyof Donnees)[]) {
    (res as unknown as Record<string, unknown[]>)[k] = Array.isArray(donnees[k]) ? donnees[k] : [];
  }
  return res;
}
