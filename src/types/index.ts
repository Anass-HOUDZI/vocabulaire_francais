/**
 * Types du domaine.
 *
 * Deux univers strictement séparés :
 *  - le LEXIQUE (immuable, versionné avec l'application, cf. src/data/lexique.ts)
 *  - l'ÉTAT UTILISATEUR (mutable, persisté localement, cf. src/lib/storage.ts)
 * Le lien entre les deux est `Mot.id`, une clé stable qui ne doit jamais changer
 * une fois publiée, sous peine de perdre la progression associée.
 */

export type Difficulte = 1 | 2 | 3 | 4 | 5

export interface Cloze {
  /** Phrase contenant exactement une séquence `___` à la place du mot cible. */
  phrase: string
  reponse: string
  /** Trois leurres de même catégorie grammaticale, faux dans ce contexte précis. */
  distracteurs: string[]
}

export interface Mot {
  /** Clé stable (slug du mot). Ne jamais modifier après publication. */
  id: string
  mot: string
  categorie: string
  /** Transcription API complète, barres obliques comprises : `/a.ta.vik/` */
  api: string
  /** Découpe syllabique API, points comme séparateurs : `a.ta.vik` */
  syllabation: string
  nbSyllabes: number
  difficulte: Difficulte
  registre: string
  theme: string
  definition: string
  exemple: string
  synonymes: string[]
  antonymes: string[]
  /** Erreur d'emploi répandue, citée telle qu'on l'entend. */
  mesusage: string
  correction: string
  etymologie: string
  cloze: Cloze
}

/* ------------------------------------------------------------------ SRS */

/** Les quatre notes de rappel, dans l'ordre croissant de réussite. */
export const NOTES = [0, 1, 2, 3] as const
export type Note = (typeof NOTES)[number]

export const LIBELLE_NOTE: Record<Note, string> = {
  0: 'À revoir',
  1: 'Difficile',
  2: 'Correct',
  3: 'Facile',
}

export type EtatCarte = 'nouveau' | 'apprentissage' | 'revision' | 'rechute'

export interface Carte {
  motId: string
  etat: EtatCarte
  /** Index dans les paliers d'apprentissage (`ETAPES_APPRENTISSAGE`). */
  etape: number
  /** Facteur de facilité SM-2, borné à [1.3, 2.8]. */
  facilite: number
  /** Intervalle courant, en jours (fractionnaire pendant l'apprentissage). */
  intervalle: number
  /** Horodatage ms du prochain passage. */
  du: number
  rechutes: number
  reussites: number
  echecs: number
  derniereRevision: number | null
  /** « Je connais déjà » : la carte sort définitivement de la file. */
  suspendue: boolean
}

export type FormatExercice =
  | 'cloze-qcm'
  | 'definition-vers-mot'
  | 'mot-vers-definition'
  | 'usage-correct'

/**
 * Trace d'une révision.
 *
 * Les champs `etatAvant`, `joursEcoules` et `intervalleAvant` ne servent à rien
 * dans le planificateur SM-2 actuel : ils sont enregistrés parce qu'un
 * optimiseur FSRS en a besoin, et qu'un historique qui ne les contient pas est
 * définitivement inexploitable. Les ajouter coûte quelques octets aujourd'hui
 * et rend la bascule possible plus tard ; les ajouter après coup ne rattraperait
 * rien.
 */
export interface LogRevision {
  motId: string
  ts: number
  note: Note
  format: FormatExercice
  /** État de la carte AVANT la révision. */
  etatAvant: EtatCarte
  /** Jours réellement écoulés depuis la révision précédente (0 à la première). */
  joursEcoules: number
  intervalleAvant: number
  intervalleApres: number
  /** Temps de réponse en ms, utile pour détecter le sur-apprentissage. */
  msReponse: number
}

/* ------------------------------------------------------- État persisté */

export type Theme = 'light' | 'dark' | 'system'

export interface Reglages {
  theme: Theme
  /** Nombre maximum de cartes nouvelles introduites par jour. */
  nouveauxParJour: number
  /** Plafond de cartes de révision par session. */
  maxParSession: number
  /** Lecture audio automatique à la révélation de la réponse. */
  audioAuto: boolean
  /** Débit de la synthèse vocale, 0.5 à 1.5. */
  debitVoix: number
  /** Comparaison stricte des accents en saisie libre. */
  accentsStricts: boolean
  /** Taille de police relative, 0.9 à 1.3. */
  echelleTexte: number
}

export const REGLAGES_DEFAUT: Reglages = {
  theme: 'system',
  nouveauxParJour: 8,
  maxParSession: 30,
  audioAuto: false,
  debitVoix: 0.95,
  accentsStricts: false,
  echelleTexte: 1,
}

/** Format sérialisé dans localStorage. `version` pilote les migrations. */
export interface EtatPersiste {
  version: number
  cartes: Record<string, Carte>
  logs: LogRevision[]
  reglages: Reglages
  /** Compteur de nouvelles cartes introduites, par jour logique (`AAAA-MM-JJ`). */
  nouveauxParJourLogique: Record<string, number>
}

/* ---------------------------------------------------------- Exercices */

export interface Exercice {
  mot: Mot
  format: FormatExercice
  /** Énoncé affiché en haut de la carte. */
  consigne: string
  /** Propositions à choix multiple, déjà mélangées. Absent en saisie libre. */
  options?: string[]
  /** Réponse attendue (texte exact d'une option, ou mot pour la saisie libre). */
  reponse: string
  /** Texte additionnel affiché sous l'énoncé (phrase à trou, définition…). */
  support?: string
}
