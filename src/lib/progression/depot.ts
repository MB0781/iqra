/**
 * Point d'entrée unique de la progression côté navigateur.
 */
import { choisirMoteur, type Moteur } from './moteurs';
import { cleConfusion, elementsAPrioriser, idSeance, noter, nouvelleCarte, type Evaluation } from './revision';
import { majEtatEtape, majEtatLecon } from './regles';
import { exporter, importer } from './echange';
import { REGLAGES_DEFAUT, TABLES, type Contexte, type Donnees, type Reglages } from './types';

export class Depot {
  constructor(public moteur: Moteur, private horloge: () => Date = () => new Date()) {}

  get seance() {
    return idSeance(this.horloge());
  }

  /** Enregistre une réponse, met à jour confusions, séance et priorités. */
  async repondre(r: { element: string; lecon: string | null; contexte: Contexte; correct: boolean; choisi?: string }) {
    const now = this.horloge();
    const seance = idSeance(now);
    await this.moteur.ajouter('reponses', { ...r, date: now.getTime(), seance });
    if (!r.correct && r.choisi && r.choisi !== r.element) {
      const cle = cleConfusion(r.element, r.choisi);
      const c = await this.moteur.lire('confusions', cle);
      await this.moteur.ecrire('confusions', { cle, cible: r.element, choisi: r.choisi, n: (c?.n ?? 0) + 1, derniere: now.getTime() });
    }
    if (r.contexte === 'revision') {
      const s = (await this.moteur.lire('seances', seance)) ?? { id: seance, revisionsTotal: 0, revisionsJustes: 0 };
      await this.moteur.ecrire('seances', { ...s, revisionsTotal: s.revisionsTotal + 1, revisionsJustes: s.revisionsJustes + (r.correct ? 1 : 0) });
    }
    if (!r.correct) {
      const duJour = (await this.moteur.tout('reponses')).filter((x) => x.seance === seance && x.element === r.element);
      if (elementsAPrioriser(duJour).includes(r.element)) {
        const carte = (await this.moteur.lire('cartes', r.element)) ?? nouvelleCarte(r.element, now);
        await this.moteur.ecrire('cartes', { ...carte, prioritaire: true });
      }
    }
  }

  /** Évalue une carte de révision (crée la carte si besoin). */
  async evaluer(element: string, e: Evaluation) {
    const now = this.horloge();
    const carte = (await this.moteur.lire('cartes', element)) ?? nouvelleCarte(element, now);
    await this.moteur.ecrire('cartes', noter(carte, e, now));
  }

  /** Ajoute des cartes pour les éléments d'une leçon réussie (sans écraser l'existant). */
  async ajouterCartes(elements: string[]) {
    const now = this.horloge();
    for (const el of elements) {
      if (!(await this.moteur.lire('cartes', el))) await this.moteur.ecrire('cartes', nouvelleCarte(el, now));
    }
  }

  async terminerLecon(lecon: string, score: number, elements: string[]) {
    const prec = await this.moteur.lire('lecons', lecon);
    const etat = majEtatLecon(prec, lecon, score, this.horloge().getTime());
    await this.moteur.ecrire('lecons', etat);
    if (etat.reussie) await this.ajouterCartes(elements);
    return etat;
  }

  async terminerTestEtape(etape: number, score: number) {
    const prec = await this.moteur.lire('etapes', etape);
    const etat = majEtatEtape(prec, etape, score, this.horloge().getTime());
    await this.moteur.ecrire('etapes', etat);
    return etat;
  }

  async reglages(): Promise<Reglages> {
    const m = await this.moteur.lire('meta', 'reglages');
    return { ...REGLAGES_DEFAUT, ...((m?.valeur as Partial<Reglages>) ?? {}) };
  }

  async definirReglages(r: Reglages) {
    await this.moteur.ecrire('meta', { cle: 'reglages', valeur: r });
  }

  async meta<T>(cle: string): Promise<T | undefined> {
    return (await this.moteur.lire('meta', cle))?.valeur as T | undefined;
  }

  async definirMeta(cle: string, valeur: unknown) {
    await this.moteur.ecrire('meta', { cle, valeur });
  }

  async toutLire(): Promise<Donnees> {
    const d = {} as Record<string, unknown[]>;
    for (const t of TABLES) d[t] = await this.moteur.tout(t);
    return d as unknown as Donnees;
  }

  async exporter(): Promise<string> {
    return exporter(await this.toutLire(), this.horloge());
  }

  async importer(texte: string) {
    await this.moteur.remplacerTout(importer(texte));
  }
}

let instance: Promise<Depot> | null = null;

export function depot(): Promise<Depot> {
  if (!instance) instance = choisirMoteur().then((m) => new Depot(m));
  return instance;
}
