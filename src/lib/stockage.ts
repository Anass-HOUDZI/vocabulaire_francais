/**
 * Persistance locale de l'état utilisateur.
 *
 * Choix MVP : `localStorage` plutôt qu'IndexedDB. L'état complet d'un utilisateur
 * assidu (quelques milliers de cartes + logs) pèse quelques centaines de kilooctets,
 * loin des 5 Mo disponibles, et l'API synchrone supprime toute gestion d'async
 * dans l'arbre React. Le passage à IndexedDB (Dexie) devient nécessaire dès qu'on
 * conserve l'historique complet sur plusieurs années ou qu'on ajoute des médias :
 * la frontière est déjà posée ici, `charger`/`sauvegarder` sont les seuls points
 * de contact avec le stockage.
 *
 * Le lexique lui-même n'est JAMAIS persisté : il est livré avec l'application.
 * Ne sont stockées que les données que l'utilisateur a produites.
 */

import type { Carte, EtatPersiste, Mot, Reglages } from '../types'
import { REGLAGES_DEFAUT, PROGRESSION_DEFAUT } from '../types'

const CLE = 'lexique.etat.v1'
const CLE_THEME = 'lexique.theme'
export const VERSION_ETAT = 1

/**
 * L'historique n'est JAMAIS tronqué.
 *
 * La tentation est grande de plafonner `logs` pour ménager le quota, mais c'est
 * exactement l'historique dont un planificateur mieux calibré (FSRS) aura besoin
 * pour être entraîné : le tronquer revient à décider aujourd'hui qu'on renonce à
 * cette amélioration. Une entrée pèse ~150 octets ; dix mille révisions tiennent
 * dans 1,5 Mo, sous le quota usuel de 5 Mo. Si le quota est malgré tout atteint,
 * `sauvegarder` le signale au lieu d'effacer discrètement le passé.
 */

export function etatVide(): EtatPersiste {
  return {
    version: VERSION_ETAT,
    cartes: {},
    logs: [],
    reglages: { ...REGLAGES_DEFAUT },
    nouveauxParJourLogique: {},
    progression: { ...PROGRESSION_DEFAUT },
  }
}

/**
 * Migre un état sérialisé vers la version courante.
 * Règle : les migrations sont ADDITIVES. On ne supprime jamais une clé de carte,
 * sous peine de perdre la progression d'un mot encore présent dans le lexique.
 */
function migrer(brut: unknown): EtatPersiste {
  if (!brut || typeof brut !== 'object') return etatVide()
  const e = brut as Partial<EtatPersiste>
  const base = etatVide()

  return {
    version: VERSION_ETAT,
    cartes: (e.cartes && typeof e.cartes === 'object' ? e.cartes : {}) as Record<string, Carte>,
    logs: Array.isArray(e.logs) ? e.logs : [],
    reglages: { ...base.reglages, ...(e.reglages ?? {}) } as Reglages,
    nouveauxParJourLogique:
      e.nouveauxParJourLogique && typeof e.nouveauxParJourLogique === 'object'
        ? e.nouveauxParJourLogique
        : {},
    progression: { ...base.progression, ...(e.progression ?? {}) },
  }
}

export function charger(): EtatPersiste {
  try {
    const brut = localStorage.getItem(CLE)
    if (!brut) return etatVide()
    return migrer(JSON.parse(brut))
  } catch {
    // Stockage indisponible (navigation privée stricte, quota, JSON corrompu) :
    // l'application doit rester utilisable, simplement sans mémoire.
    return etatVide()
  }
}

export type ResultatSauvegarde = 'ok' | 'quota' | 'indisponible'

/**
 * Écrit l'état. Ne lève jamais : renvoie la cause de l'échec, que l'interface
 * doit signaler — une progression qui ne se sauvegarde plus en silence est le
 * pire mode de défaillance de cette application.
 */
export function sauvegarder(etat: EtatPersiste): ResultatSauvegarde {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat))
    return 'ok'
  } catch (e) {
    const quota =
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    return quota ? 'quota' : 'indisponible'
  }
}

export function memoriserTheme(theme: string): void {
  try {
    if (theme === 'system') localStorage.removeItem(CLE_THEME)
    else localStorage.setItem(CLE_THEME, theme)
  } catch {
    /* ignoré */
  }
}

/* ------------------------------------------------- Import / export JSON */

export function exporterJSON(etat: EtatPersiste): string {
  return JSON.stringify(etat, null, 2)
}

/**
 * Importe un export précédent. Renvoie `null` si le fichier est inexploitable,
 * afin que l'appelant puisse afficher une erreur sans écraser l'état en place.
 */
export function importerJSON(texte: string): EtatPersiste | null {
  try {
    const brut: unknown = JSON.parse(texte)
    if (!brut || typeof brut !== 'object' || !('cartes' in brut)) return null
    return migrer(brut)
  } catch {
    return null
  }
}

/* ------------------------------------------------- Export Anki TSV */

/**
 * Exporte une liste de mots sous forme de tableau TSV UTF-8 reconnu nativement par Anki.
 * Format structuré avec en-têtes et tags de domaine pour une révision immédiate.
 */
export function exporterAnkiTSV(mots: readonly Mot[]): string {
  const enTete = [
    '#separator:tab',
    '#html:true',
    '#tags column:8',
    'Mot\tPrononciation (API)\tNature\tDéfinition\tExemple littéraire\tÉtymologie\tSynonymes / Antonymes\tDomaine',
  ].join('\n')

  const lignes = mots.map((m) => {
    const mot = m.mot.replace(/\t/g, ' ')
    const api = m.api ? m.api.replace(/\t/g, ' ') : ''
    const nature = [m.categorie, m.registre].filter(Boolean).join(' · ').replace(/\t/g, ' ')
    const def = m.definition.replace(/\t/g, ' ').replace(/\n/g, '<br>')
    const ex = m.exemple ? m.exemple.replace(/\t/g, ' ').replace(/\n/g, '<br>') : ''
    const etymo = m.etymologie ? m.etymologie.replace(/\t/g, ' ').replace(/\n/g, '<br>') : ''
    const relations = [
      m.synonymes?.length ? `Syn. : ${m.synonymes.join(', ')}` : '',
      m.antonymes?.length ? `Ant. : ${m.antonymes.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join(' | ')
      .replace(/\t/g, ' ')
    const domaine = (m.theme || 'Général').replace(/\t/g, ' ')

    return `${mot}\t${api}\t${nature}\t${def}\t${ex}\t${etymo}\t${relations}\t${domaine}`
  })

  return [enTete, ...lignes].join('\n')
}
