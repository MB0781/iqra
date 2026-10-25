/**
 * Moteurs de stockage : IndexedDB (Dexie) en priorité, localStorage en repli,
 * mémoire pour les tests. Tous exposent la même interface minimale.
 */
import Dexie, { type Table } from 'dexie';
import { CLES, TABLES, donneesVides, type Donnees, type NomTable } from './types';

export interface Moteur {
  readonly nom: 'indexeddb' | 'localstorage' | 'memoire';
  tout<T extends NomTable>(table: T): Promise<Donnees[T]>;
  lire<T extends NomTable>(table: T, cle: string | number): Promise<Donnees[T][number] | undefined>;
  ecrire<T extends NomTable>(table: T, valeur: Donnees[T][number]): Promise<void>;
  ajouter(table: 'reponses', valeur: Donnees['reponses'][number]): Promise<number>;
  remplacerTout(d: Donnees): Promise<void>;
}

/** Versions du schéma IndexedDB. Ajouter une nouvelle version ici, ne jamais modifier une ancienne. */
class BaseIqra extends Dexie {
  reponses!: Table;
  cartes!: Table;
  lecons!: Table;
  etapes!: Table;
  confusions!: Table;
  seances!: Table;
  meta!: Table;
  constructor(nom: string) {
    super(nom);
    this.version(1).stores({
      reponses: '++id, element, seance, contexte',
      cartes: 'element, due',
      lecons: 'lecon',
      etapes: 'etape',
      confusions: 'cle, n',
      seances: 'id',
      meta: 'cle',
    });
  }
}

export class MoteurDexie implements Moteur {
  readonly nom = 'indexeddb' as const;
  private db: BaseIqra;
  constructor(nom = 'iqra') {
    this.db = new BaseIqra(nom);
  }
  private t(table: NomTable): Table {
    return this.db.table(table);
  }
  async ouvrir() {
    await this.db.open();
  }
  async tout<T extends NomTable>(table: T) {
    return (await this.t(table).toArray()) as Donnees[T];
  }
  async lire<T extends NomTable>(table: T, cle: string | number) {
    return (await this.t(table).get(cle)) as Donnees[T][number] | undefined;
  }
  async ecrire<T extends NomTable>(table: T, valeur: Donnees[T][number]) {
    await this.t(table).put(valeur);
  }
  async ajouter(table: 'reponses', valeur: Donnees['reponses'][number]) {
    return (await this.t(table).add(valeur)) as number;
  }
  async remplacerTout(d: Donnees) {
    await this.db.transaction('rw', TABLES.map((n) => this.t(n)), async () => {
      for (const n of TABLES) {
        await this.t(n).clear();
        await this.t(n).bulkPut(d[n] as unknown[]);
      }
    });
  }
}

/** Repli : tout tient dans un seul document JSON. */
export class MoteurMemoire implements Moteur {
  readonly nom: 'memoire' | 'localstorage' = 'memoire';
  protected d: Donnees = donneesVides();
  protected sauver() {}
  async tout<T extends NomTable>(table: T) {
    return structuredClone(this.d[table]);
  }
  async lire<T extends NomTable>(table: T, cle: string | number) {
    const k = CLES[table];
    const v = (this.d[table] as unknown as Record<string, unknown>[]).find((x) => x[k] === cle);
    return v ? (structuredClone(v) as Donnees[T][number]) : undefined;
  }
  async ecrire<T extends NomTable>(table: T, valeur: Donnees[T][number]) {
    const k = CLES[table];
    const liste = this.d[table] as unknown as Record<string, unknown>[];
    const v = valeur as unknown as Record<string, unknown>;
    const i = liste.findIndex((x) => x[k] === v[k]);
    if (i >= 0) liste[i] = structuredClone(v);
    else liste.push(structuredClone(v));
    this.sauver();
  }
  async ajouter(_table: 'reponses', valeur: Donnees['reponses'][number]) {
    const id = this.d.reponses.reduce((m, r) => Math.max(m, r.id ?? 0), 0) + 1;
    this.d.reponses.push({ ...valeur, id });
    this.sauver();
    return id;
  }
  async remplacerTout(d: Donnees) {
    this.d = structuredClone(d);
    this.sauver();
  }
}

export const CLE_LOCALSTORAGE = 'iqra:progression';

export class MoteurLocalStorage extends MoteurMemoire {
  override readonly nom = 'localstorage' as const;
  constructor(private stockage: Storage) {
    super();
    try {
      const brut = stockage.getItem(CLE_LOCALSTORAGE);
      if (brut) this.d = { ...donneesVides(), ...JSON.parse(brut).donnees };
    } catch {
      this.d = donneesVides();
    }
  }
  protected override sauver() {
    try {
      this.stockage.setItem(CLE_LOCALSTORAGE, JSON.stringify({ version: 1, donnees: this.d }));
    } catch {
      // stockage plein ou interdit : la progression reste en mémoire pour cette visite
    }
  }
}

/** Choisit le meilleur moteur disponible dans ce navigateur. */
export async function choisirMoteur(): Promise<Moteur> {
  if (typeof indexedDB !== 'undefined') {
    try {
      const m = new MoteurDexie();
      await m.ouvrir();
      return m;
    } catch {
      // navigation privée stricte, IndexedDB désactivé…
    }
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('iqra:test', '1');
      localStorage.removeItem('iqra:test');
      return new MoteurLocalStorage(localStorage);
    }
  } catch {
    // localStorage indisponible
  }
  return new MoteurMemoire();
}
