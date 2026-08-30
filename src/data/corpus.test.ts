/**
 * Invariants du corpus.
 *
 * Le lexique est produit par lots puis relu ; ces contrôles sont le filet qui
 * empêche une entrée mal formée d'atteindre une session de révision. Ils portent
 * sur ce qu'une relecture humaine laisse passer le plus facilement : un nombre
 * de syllabes désaccordé de la découpe API, une définition qui contient le mot
 * défini, un distracteur qui serait en fait recevable.
 *
 * Ils s'exécutent avec `npm test`, donc avant chaque build.
 */

import { describe, expect, it } from 'vitest'
import { CORPUS } from './corpus'
import { canoniser, slug } from '../lib/texte'

/** Radical grossier du lemme, robuste aux formes fléchies des exemples. */
const radical = (mot: string) => canoniser(mot).replace(/^s'/, '').slice(0, 5)

const THEMES_ATTENDUS = new Set([
  'Pensée, argumentation, rhétorique',
  'Caractère, affects, comportement',
  'Style, esthétique, perception',
  'Société, pouvoir, institutions',
])

describe('corpus — structure', () => {
  it('contient au moins 50 entrées', () => {
    expect(CORPUS.length).toBeGreaterThanOrEqual(50)
  })

  it("n'a aucun identifiant dupliqué", () => {
    const ids = CORPUS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('dérive chaque identifiant du mot', () => {
    for (const m of CORPUS) expect(m.id, m.mot).toBe(slug(m.mot))
  })

  it("n'a aucun mot dupliqué", () => {
    const mots = CORPUS.map((m) => canoniser(m.mot))
    expect(new Set(mots).size).toBe(mots.length)
  })
})

describe('corpus — phonétique', () => {
  it('accorde nbSyllabes avec la découpe syllabique', () => {
    for (const m of CORPUS) {
      expect(m.syllabation.split('.').length, m.mot).toBe(m.nbSyllabes)
    }
  })

  it("accorde la transcription API avec la découpe", () => {
    for (const m of CORPUS) {
      expect(m.api.replace(/\//g, ''), m.mot).toBe(m.syllabation)
    }
  })

  it('encadre la transcription API par des barres obliques', () => {
    for (const m of CORPUS) expect(m.api, m.mot).toMatch(/^\/.+\/$/)
  })

  it('ne retient que des mots trisyllabiques', () => {
    for (const m of CORPUS) expect(m.nbSyllabes, m.mot).toBe(3)
  })

  it("n'utilise pas de notation SAMPA à la place de l'API", () => {
    // Les majuscules sont le marqueur le plus fiable d'une transcription SAMPA
    // (`E`, `O`, `9`, `R`) laissée telle quelle.
    for (const m of CORPUS) expect(m.api, m.mot).not.toMatch(/[A-Z0-9]/)
  })
})

describe('corpus — rédaction', () => {
  it('ne définit jamais un mot par lui-même', () => {
    for (const m of CORPUS) {
      expect(canoniser(m.definition), m.mot).not.toContain(radical(m.mot))
    }
  })

  it("emploie le mot dans l'exemple", () => {
    for (const m of CORPUS) {
      expect(canoniser(m.exemple), m.mot).toContain(radical(m.mot))
    }
  })

  it('documente un mésusage et sa correction', () => {
    for (const m of CORPUS) {
      expect(m.mesusage.length, m.mot).toBeGreaterThan(20)
      expect(m.correction.length, m.mot).toBeGreaterThan(20)
    }
  })

  it('fournit au moins deux synonymes et un antonyme, distincts du mot', () => {
    for (const m of CORPUS) {
      expect(m.synonymes.length, m.mot).toBeGreaterThanOrEqual(2)
      expect(m.antonymes.length, m.mot).toBeGreaterThanOrEqual(1)
      for (const s of [...m.synonymes, ...m.antonymes]) {
        expect(canoniser(s), m.mot).not.toBe(canoniser(m.mot))
      }
    }
  })

  it('renseigne une difficulté, un registre et un champ thématique connu', () => {
    for (const m of CORPUS) {
      expect(m.difficulte, m.mot).toBeGreaterThanOrEqual(1)
      expect(m.difficulte, m.mot).toBeLessThanOrEqual(5)
      expect(m.registre.length, m.mot).toBeGreaterThan(2)
      expect(THEMES_ATTENDUS.has(m.theme), `${m.mot} → ${m.theme}`).toBe(true)
    }
  })

  it('applique la typographie française des guillemets', () => {
    for (const m of CORPUS) {
      expect(m.mesusage, m.mot).not.toMatch(/«\S|\S»/)
    }
  })
})

describe('corpus — exercices', () => {
  it('marque un trou unique dans chaque phrase à compléter', () => {
    for (const m of CORPUS) {
      expect(m.cloze.phrase.split('___').length - 1, m.mot).toBe(1)
    }
  })

  it('relie la réponse du cloze au lemme, forme fléchie comprise', () => {
    for (const m of CORPUS) {
      expect(canoniser(m.cloze.reponse), m.mot).toContain(radical(m.mot))
    }
  })

  it('fournit trois distracteurs uniques et distincts de la réponse', () => {
    for (const m of CORPUS) {
      const d = m.cloze.distracteurs
      expect(d.length, m.mot).toBe(3)
      expect(new Set(d.map(canoniser)).size, m.mot).toBe(3)
      for (const x of d) expect(canoniser(x), m.mot).not.toBe(canoniser(m.cloze.reponse))
    }
  })

  it("n'utilise jamais un synonyme du mot comme distracteur", () => {
    for (const m of CORPUS) {
      const synonymes = new Set(m.synonymes.map(canoniser))
      for (const d of m.cloze.distracteurs) {
        expect(synonymes.has(canoniser(d)), `${m.mot} → ${d}`).toBe(false)
      }
    }
  })
})
