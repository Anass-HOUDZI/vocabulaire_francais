/**
 * Accès au lexique.
 *
 * Séparation volontaire : `corpus.ts` ne contient QUE des données (il est
 * régénérable par script, et son diff reste lisible), ce module contient la
 * logique de dérivation et les invariants. Le corpus est immuable à l'exécution
 * et versionné avec l'application ; la progression de l'utilisateur vit ailleurs
 * (cf. `lib/stockage.ts`) et n'est jointe que par `Mot.id`.
 */

import type { Mot } from '../types'
import { CORPUS } from './corpus'

export const LEXIQUE: readonly Mot[] = CORPUS

/** Index par identifiant : les composants n'ont jamais à balayer le tableau. */
export const PAR_ID: ReadonlyMap<string, Mot> = new Map(CORPUS.map((m) => [m.id, m]))

const uniqueTrie = (valeurs: string[]) =>
  [...new Set(valeurs)].sort((a, b) => a.localeCompare(b, 'fr'))

export const THEMES: readonly string[] = uniqueTrie(CORPUS.map((m) => m.theme))
export const CATEGORIES: readonly string[] = uniqueTrie(CORPUS.map((m) => m.categorie))
export const SYLLABES_DISPONIBLES: readonly number[] = [
  ...new Set(CORPUS.map((m) => m.nbSyllabes)),
].sort((a, b) => a - b)

/**
 * Les invariants du corpus (identifiants uniques, accord entre `nbSyllabes` et
 * la découpe API, définition qui ne contient pas le mot défini, distracteurs
 * recevables…) sont vérifiés par `corpus.test.ts`, donc à chaque `npm test` et
 * avant chaque build — et non à l'exécution, où ils alourdiraient le bundle
 * pour un contrôle que l'utilisateur ne peut de toute façon pas corriger.
 */
