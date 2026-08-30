/**
 * Traitement du texte français : accentuation, comparaison tolérante, slugs.
 *
 * Enjeu principal : sur mobile, saisir « é » coûte un appui long. Refuser
 * « proteiforme » parce qu'il manque un accent transforme un exercice de lexique
 * en exercice de clavier. On accepte donc la réponse, mais on le SIGNALE —
 * l'accent reste une information orthographique qu'il faut apprendre.
 */

/** Supprime les diacritiques (NFD puis retrait des marques combinantes). */
export function sansAccents(s: string): string {
  // \p{M} = marques combinantes ; on évite l'intervalle littéral U+0300–U+036F,
  // invisible dans un éditeur et cassé par un enregistrement en latin-1.
  return s.normalize('NFD').replace(/\p{M}/gu, '')
}

/** Forme canonique pour comparaison : sans accents, minuscule, espaces réduits. */
export function canoniser(s: string): string {
  return sansAccents(s)
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' -]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Identifiant stable dérivé du mot. Sert de clé de jointure lexique ↔ progression. */
export function slug(s: string): string {
  return canoniser(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/** Distance de Levenshtein, bornée : au-delà de `max`, renvoie `max + 1`. */
export function distance(a: string, b: string, max = 3): number {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > max) return max + 1

  let precedente = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const courante = [i]
    let minLigne = i
    for (let j = 1; j <= b.length; j++) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1
      const v = Math.min(
        (precedente[j] ?? 0) + 1,
        (courante[j - 1] ?? 0) + 1,
        (precedente[j - 1] ?? 0) + cout,
      )
      courante[j] = v
      if (v < minLigne) minLigne = v
    }
    if (minLigne > max) return max + 1
    precedente = courante
  }
  return precedente[b.length] ?? max + 1
}

export interface Verdict {
  /** La réponse est-elle acceptée ? */
  correct: boolean
  /** Juste au sens strict, accents et casse compris. */
  exact: boolean
  /** Acceptée, mais un ou plusieurs accents manquent ou sont erronés. */
  accentManquant: boolean
  /** Acceptée malgré une petite faute de frappe (distance 1). */
  fauteFrappe: boolean
}

/**
 * Compare une saisie libre à la réponse attendue.
 *
 * Tolérance par défaut, du plus strict au plus permissif :
 *  1. égalité stricte → exact
 *  2. égalité après canonisation → accent ou casse manquants, accepté et signalé
 *  3. distance de Levenshtein ≤ 1 sur les formes canonisées (mots ≥ 5 lettres)
 *     → faute de frappe, acceptée et signalée
 *
 * `accentsStricts` désactive l'étape 2 pour qui veut travailler l'orthographe.
 */
export function comparerReponse(
  saisie: string,
  attendu: string,
  options: { accentsStricts?: boolean; tolererFrappe?: boolean } = {},
): Verdict {
  const { accentsStricts = false, tolererFrappe = true } = options
  const a = saisie.trim()
  const b = attendu.trim()

  if (a === b) return { correct: true, exact: true, accentManquant: false, fauteFrappe: false }

  const ca = canoniser(a)
  const cb = canoniser(b)
  if (!ca) return { correct: false, exact: false, accentManquant: false, fauteFrappe: false }

  if (ca === cb) {
    const accentManquant = sansAccents(a.toLowerCase()) === a.toLowerCase() && a.toLowerCase() !== b.toLowerCase()
    return {
      correct: !accentsStricts,
      exact: false,
      accentManquant: true,
      fauteFrappe: !accentManquant && false,
    }
  }

  if (tolererFrappe && cb.length >= 5 && distance(ca, cb, 1) <= 1) {
    return { correct: true, exact: false, accentManquant: false, fauteFrappe: true }
  }

  return { correct: false, exact: false, accentManquant: false, fauteFrappe: false }
}

/** Mélange déterministe (Fisher-Yates) — la graine rend les tests reproductibles. */
export function melanger<T>(items: readonly T[], graine: number): T[] {
  const out = items.slice()
  let etat = graine >>> 0 || 1
  for (let i = out.length - 1; i > 0; i--) {
    // xorshift32 : suffisant pour mélanger 4 options, et sans dépendance.
    etat ^= etat << 13
    etat ^= etat >>> 17
    etat ^= etat << 5
    etat >>>= 0
    const j = etat % (i + 1)
    const tmp = out[i] as T
    out[i] = out[j] as T
    out[j] = tmp
  }
  return out
}

/** Découpe une phrase à trou autour du marqueur `___`. */
export function decouperCloze(phrase: string): { avant: string; apres: string } {
  const i = phrase.indexOf('___')
  if (i === -1) return { avant: phrase, apres: '' }
  return { avant: phrase.slice(0, i), apres: phrase.slice(i + 3) }
}
