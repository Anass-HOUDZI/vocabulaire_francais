/**
 * Fabrique d'exercices.
 *
 * Principe directeur : un même mot ne doit pas revenir toujours sous la même
 * forme. Reconnaître « atavique » dans une liste de quatre propositions et le
 * produire soi-même à partir d'une définition sont deux compétences distinctes ;
 * n'entraîner que la première donne une illusion de maîtrise qui s'effondre à
 * l'usage. La rotation ci-dessous suit l'état de la carte : reconnaissance
 * pendant l'apprentissage, rappel actif et discrimination d'usage en révision.
 */

import type { Carte, Exercice, FormatExercice, Mot } from '../types'
import { melanger } from './texte'

/** Hachage stable (FNV-1a 32 bits) : sert de graine aux mélanges reproductibles. */
export function hacher(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

/**
 * Choisit le format d'exercice pour une carte donnée.
 *
 * - `nouveau` : aucun exercice, on présente d'abord la fiche complète.
 * - `apprentissage` / `rechute` : reconnaissance, moins coûteuse, pour ancrer la forme.
 * - `revision` : alternance rappel actif ↔ discrimination d'usage, le rappel
 *   actif restant majoritaire (2 fois sur 3).
 */
export function choisirFormat(carte: Carte): FormatExercice | null {
  if (carte.etat === 'nouveau') return null
  if (carte.etat === 'apprentissage' || carte.etat === 'rechute') {
    return (carte.reussites + carte.echecs) % 2 === 0 ? 'cloze-qcm' : 'mot-vers-definition'
  }
  const tour = carte.reussites % 3
  return tour === 2 ? 'usage-correct' : 'definition-vers-mot'
}

const ARTICLE = /^(le |la |les |un |une |des |l')/i

/** Tronque une définition pour l'afficher comme option de QCM. */
function abreger(texte: string, max = 120): string {
  const t = texte.trim()
  if (t.length <= max) return t
  const coupe = t.slice(0, max)
  const dernierEspace = coupe.lastIndexOf(' ')
  return `${coupe.slice(0, dernierEspace > 40 ? dernierEspace : max)}…`
}

/**
 * Sélectionne des leurres crédibles parmi le lexique.
 *
 * Qualité d'un bon leurre : même catégorie grammaticale, registre comparable,
 * longueur voisine, et de préférence le même champ thématique — un leurre pris
 * au hasard dans tout le corpus se trahit immédiatement et rend l'exercice
 * décoratif. On ne prend jamais un synonyme du mot cible, qui serait recevable.
 */
export function choisirLeurres(
  cible: Mot,
  lexique: readonly Mot[],
  n: number,
  graine: number,
): Mot[] {
  const synonymes = new Set(cible.synonymes.map((s) => s.toLowerCase()))
  const candidats = lexique.filter(
    (m) => m.id !== cible.id && !synonymes.has(m.mot.toLowerCase()),
  )

  const score = (m: Mot) =>
    (m.categorie === cible.categorie ? 0 : 10) +
    (m.theme === cible.theme ? 0 : 3) +
    Math.abs(m.nbSyllabes - cible.nbSyllabes) +
    Math.abs(m.mot.length - cible.mot.length) * 0.2 +
    Math.abs(m.difficulte - cible.difficulte) * 0.5

  // On tire dans un vivier élargi puis on mélange : sans cela, les mêmes leurres
  // reviendraient à chaque passage et deviendraient reconnaissables.
  const vivier = candidats
    .slice()
    .sort((a, b) => score(a) - score(b))
    .slice(0, Math.max(n * 3, 8))
  return melanger(vivier, graine).slice(0, n)
}

/**
 * Construit l'exercice à présenter pour une carte.
 * Renvoie `null` pour une carte neuve : l'appelant affiche alors la fiche.
 */
export function construireExercice(
  carte: Carte,
  mot: Mot,
  lexique: readonly Mot[],
): Exercice | null {
  const format = choisirFormat(carte)
  if (!format) return null

  const graine = hacher(`${mot.id}:${carte.reussites}:${carte.echecs}`)

  switch (format) {
    case 'cloze-qcm': {
      // Les leurres sont fournis par le lexique lui-même : ils ont été écrits
      // pour ce contexte précis, ce qu'aucune heuristique ne saurait égaler.
      const options = melanger([mot.cloze.reponse, ...mot.cloze.distracteurs], graine)
      return {
        mot,
        format,
        consigne: 'Complétez la phrase',
        support: mot.cloze.phrase,
        options,
        reponse: mot.cloze.reponse,
      }
    }

    case 'mot-vers-definition': {
      const leurres = choisirLeurres(mot, lexique, 3, graine)
      const bonne = abreger(mot.definition)
      const options = melanger([bonne, ...leurres.map((m) => abreger(m.definition))], graine + 1)
      return {
        mot,
        format,
        consigne: `Que signifie « ${mot.mot} » ?`,
        options,
        reponse: bonne,
      }
    }

    case 'definition-vers-mot': {
      return {
        mot,
        format,
        consigne: 'Quel mot correspond à cette définition ?',
        support: mot.definition.replace(ARTICLE, (m) => m),
        reponse: mot.mot,
      }
    }

    case 'usage-correct': {
      // La phrase fautive vient du champ « mésusage » du lexique : c'est une
      // erreur réellement répandue, pas un contre-exemple inventé.
      const fautive = mot.mesusage
      const options = melanger([mot.exemple, fautive], graine + 2)
      return {
        mot,
        format,
        consigne: `Laquelle de ces deux phrases emploie « ${mot.mot} » correctement ?`,
        options,
        reponse: mot.exemple,
      }
    }
  }
}

export const LIBELLE_FORMAT: Record<FormatExercice, string> = {
  'cloze-qcm': 'Phrase à compléter',
  'definition-vers-mot': 'Rappel actif',
  'mot-vers-definition': 'Reconnaissance',
  'usage-correct': "Discrimination d'usage",
}
