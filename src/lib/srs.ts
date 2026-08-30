/**
 * Répétition espacée — variante SM-2 à quatre notes, avec paliers d'apprentissage.
 *
 * Contrat : ce module est PUR. Aucune lecture d'horloge, aucun accès au stockage.
 * L'instant courant est toujours passé en paramètre (`maintenant`), ce qui rend
 * l'ensemble testable de façon déterministe (cf. srs.test.ts) et immunise le
 * planificateur contre les changements d'heure et les dérives de fuseau.
 *
 * Pourquoi SM-2 et pas FSRS au MVP : FSRS donne une meilleure rétention mais
 * suppose un historique de révisions pour être calibré (cold start) et pèse
 * une dépendance supplémentaire. SM-2 tient en ~120 lignes lisibles et suffit
 * largement en dessous de quelques milliers de révisions. La bascule vers FSRS
 * est prévue en v2 : `LogRevision` enregistre déjà tout ce qu'il faut pour
 * entraîner un modèle a posteriori.
 */

import type { Carte, EtatCarte, LogRevision, Note } from '../types'

export const JOUR_MS = 86_400_000
export const MINUTE_MS = 60_000

/** Paliers d'apprentissage, en minutes, avant le passage en révision. */
export const ETAPES_APPRENTISSAGE = [1, 10] as const

/** Paliers de reprise après un oubli, en minutes. */
export const ETAPES_RECHUTE = [10] as const

export const FACILITE_DEFAUT = 2.5
export const FACILITE_MIN = 1.3
export const FACILITE_MAX = 2.8

/** Intervalle du premier passage en révision (jours). */
export const INTERVALLE_DIPLOME = 1
/** Intervalle appliqué à un « Facile » qui saute l'apprentissage. */
export const INTERVALLE_DIPLOME_FACILE = 4
/** Multiplicateur appliqué à l'intervalle après un « Difficile ». */
export const FACTEUR_DIFFICILE = 1.2
/** Bonus appliqué après un « Facile ». */
export const BONUS_FACILE = 1.3
/** Part de l'intervalle conservée après une rechute. */
export const FACTEUR_RECHUTE = 0.4
/** Plafond de sécurité : au-delà, l'espacement n'apporte plus rien d'utile. */
export const INTERVALLE_MAX = 365

/**
 * Heure de bascule du « jour logique ». Une révision faite à 1 h du matin
 * appartient à la journée précédente : sans cela, un utilisateur nocturne voit
 * son quota de nouveaux mots se réinitialiser en pleine session.
 */
export const HEURE_BASCULE = 4

/** Renvoie le jour logique (`AAAA-MM-JJ`) d'un horodatage, en heure locale. */
export function jourLogique(ts: number, heureBascule = HEURE_BASCULE): string {
  const d = new Date(ts - heureBascule * 3_600_000)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const jj = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${jj}`
}

export function creerCarte(motId: string, maintenant: number): Carte {
  return {
    motId,
    etat: 'nouveau',
    etape: 0,
    facilite: FACILITE_DEFAUT,
    intervalle: 0,
    du: maintenant,
    rechutes: 0,
    reussites: 0,
    echecs: 0,
    derniereRevision: null,
    suspendue: false,
  }
}

const borner = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x))

/**
 * Ajustement du facteur de facilité, repris de SM-2 mais exprimé sur 4 notes.
 * « À revoir » pénalise fortement, « Facile » récompense modérément.
 */
function ajusterFacilite(facilite: number, note: Note): number {
  const delta = [-0.2, -0.15, 0, 0.15][note] ?? 0
  return borner(facilite + delta, FACILITE_MIN, FACILITE_MAX)
}

/**
 * Planifie le prochain passage d'une carte.
 *
 * @param carte      état courant (non muté)
 * @param note       jugement de rappel de l'utilisateur
 * @param maintenant horodatage ms de la réponse
 * @returns une nouvelle carte ; l'appelant est responsable de la persistance
 */
export function planifier(carte: Carte, note: Note, maintenant: number): Carte {
  const suivante: Carte = { ...carte, derniereRevision: maintenant }

  if (note === 0) {
    suivante.echecs += 1
  } else {
    suivante.reussites += 1
  }

  const etatAvant: EtatCarte = carte.etat

  // --- Échec : retour en file de reprise, quel que soit l'état antérieur.
  if (note === 0) {
    if (etatAvant === 'revision') {
      suivante.rechutes += 1
      suivante.intervalle = Math.max(1, Math.round(carte.intervalle * FACTEUR_RECHUTE))
    }
    suivante.etat = etatAvant === 'revision' || etatAvant === 'rechute' ? 'rechute' : 'apprentissage'
    suivante.etape = 0
    suivante.facilite = ajusterFacilite(carte.facilite, note)
    const minutes = suivante.etat === 'rechute' ? ETAPES_RECHUTE[0] : ETAPES_APPRENTISSAGE[0]
    suivante.du = maintenant + minutes * MINUTE_MS
    return suivante
  }

  suivante.facilite = ajusterFacilite(carte.facilite, note)

  // --- Phases d'apprentissage / de reprise : on progresse dans les paliers.
  if (etatAvant === 'nouveau' || etatAvant === 'apprentissage' || etatAvant === 'rechute') {
    const paliers = etatAvant === 'rechute' ? ETAPES_RECHUTE : ETAPES_APPRENTISSAGE

    // « Facile » fait sortir immédiatement de l'apprentissage.
    if (note === 3) {
      suivante.etat = 'revision'
      suivante.etape = 0
      suivante.intervalle =
        etatAvant === 'rechute'
          ? Math.max(INTERVALLE_DIPLOME, suivante.intervalle)
          : INTERVALLE_DIPLOME_FACILE
      suivante.du = maintenant + suivante.intervalle * JOUR_MS
      return suivante
    }

    // « Difficile » fait piétiner sur le palier courant, « Correct » avance.
    const etapeCible = note === 1 ? carte.etape : carte.etape + 1
    if (etapeCible >= paliers.length) {
      suivante.etat = 'revision'
      suivante.etape = 0
      suivante.intervalle =
        etatAvant === 'rechute' ? Math.max(1, suivante.intervalle) : INTERVALLE_DIPLOME
      suivante.du = maintenant + suivante.intervalle * JOUR_MS
      return suivante
    }
    suivante.etat = etatAvant === 'rechute' ? 'rechute' : 'apprentissage'
    suivante.etape = etapeCible
    suivante.du = maintenant + (paliers[etapeCible] ?? paliers[0]) * MINUTE_MS
    return suivante
  }

  // --- Révision confirmée : croissance multiplicative.
  const base = Math.max(1, carte.intervalle)
  const facteur = note === 1 ? FACTEUR_DIFFICILE : note === 3 ? suivante.facilite * BONUS_FACILE : suivante.facilite
  suivante.etat = 'revision'
  suivante.etape = 0
  suivante.intervalle = borner(Math.round(base * facteur), 1, INTERVALLE_MAX)
  suivante.du = maintenant + suivante.intervalle * JOUR_MS
  return suivante
}

/** Aperçu des intervalles proposés par chaque bouton, pour l'affichage. */
export function apercuIntervalles(carte: Carte, maintenant: number): Record<Note, string> {
  const rendu = {} as Record<Note, string>
  for (const note of [0, 1, 2, 3] as Note[]) {
    const c = planifier(carte, note, maintenant)
    rendu[note] = formaterDelai(c.du - maintenant)
  }
  return rendu
}

export function formaterDelai(ms: number): string {
  if (ms < 60 * MINUTE_MS) return `${Math.max(1, Math.round(ms / MINUTE_MS))} min`
  if (ms < JOUR_MS) return `${Math.round(ms / (60 * MINUTE_MS))} h`
  const jours = Math.round(ms / JOUR_MS)
  if (jours < 30) return `${jours} j`
  if (jours < 365) return `${Math.round(jours / 30)} mois`
  return `${(jours / 365).toFixed(1)} an${jours >= 730 ? 's' : ''}`
}

/**
 * Construit la file du jour.
 *
 * Ordre volontaire : les cartes en cours d'apprentissage d'abord (elles sont
 * dues à la minute et leur report casse la boucle de rappel), puis les révisions
 * les plus en retard, puis les nouveautés dans la limite du quota quotidien.
 *
 * Le plafond `maxParSession` protège du backlog explosif : après deux semaines
 * d'absence, la file brute peut compter des centaines de cartes, ce qui suffit
 * à faire abandonner l'utilisateur.
 */
export function fileDuJour(
  cartes: Carte[],
  maintenant: number,
  options: { nouveauxRestants: number; maxParSession: number },
): Carte[] {
  const actives = cartes.filter((c) => !c.suspendue)
  const dues = actives.filter((c) => c.etat !== 'nouveau' && c.du <= maintenant)

  const enCours = dues
    .filter((c) => c.etat === 'apprentissage' || c.etat === 'rechute')
    .sort((a, b) => a.du - b.du)
  const revisions = dues.filter((c) => c.etat === 'revision').sort((a, b) => a.du - b.du)
  const nouveaux = actives
    .filter((c) => c.etat === 'nouveau')
    .slice(0, Math.max(0, options.nouveauxRestants))

  return [...enCours, ...revisions, ...nouveaux].slice(0, options.maxParSession)
}

/* -------------------------------------------------------- Statistiques */

export interface Statistiques {
  total: number
  nouveaux: number
  enApprentissage: number
  jeunes: number
  matures: number
  suspendues: number
  /** Taux de rappel sur les 30 derniers jours (note > 0), `null` si aucun log. */
  retention30j: number | null
  revisionsAujourdhui: number
  /** Charge prévisionnelle, index 0 = aujourd'hui, jusqu'à J+6. */
  chargePrevue: number[]
  serie: number
}

/** Une carte est « mature » au-delà de 21 jours d'intervalle (seuil Anki usuel). */
export const SEUIL_MATURITE = 21

export function calculerStatistiques(
  cartes: Carte[],
  logs: LogRevision[],
  maintenant: number,
): Statistiques {
  const actives = cartes.filter((c) => !c.suspendue)
  const revisions = actives.filter((c) => c.etat === 'revision')

  const debut30j = maintenant - 30 * JOUR_MS
  const recents = logs.filter((l) => l.ts >= debut30j && l.intervalleAvant > 0)
  const retention30j = recents.length ? recents.filter((l) => l.note > 0).length / recents.length : null

  const jourCourant = jourLogique(maintenant)
  const revisionsAujourdhui = logs.filter((l) => jourLogique(l.ts) === jourCourant).length

  const chargePrevue = Array.from({ length: 7 }, (_, i) => {
    const borne = maintenant + (i + 1) * JOUR_MS
    const min = maintenant + i * JOUR_MS
    return actives.filter((c) => c.etat !== 'nouveau' && c.du < borne && (i === 0 || c.du >= min)).length
  })

  // Série : nombre de jours logiques consécutifs, en remontant, comportant au
  // moins une révision. On tolère l'absence de révision aujourd'hui (la journée
  // n'est pas finie) sans casser la série.
  const joursAvecRevision = new Set(logs.map((l) => jourLogique(l.ts)))
  let serie = 0
  let curseur = maintenant
  if (!joursAvecRevision.has(jourLogique(curseur))) curseur -= JOUR_MS
  while (joursAvecRevision.has(jourLogique(curseur))) {
    serie += 1
    curseur -= JOUR_MS
  }

  return {
    total: cartes.length,
    nouveaux: actives.filter((c) => c.etat === 'nouveau').length,
    enApprentissage: actives.filter((c) => c.etat === 'apprentissage' || c.etat === 'rechute').length,
    jeunes: revisions.filter((c) => c.intervalle < SEUIL_MATURITE).length,
    matures: revisions.filter((c) => c.intervalle >= SEUIL_MATURITE).length,
    suspendues: cartes.filter((c) => c.suspendue).length,
    retention30j,
    revisionsAujourdhui,
    chargePrevue,
    serie,
  }
}
