import { describe, expect, it } from 'vitest'
import { canoniser, comparerReponse, decouperCloze, distance, melanger, sansAccents, slug } from './texte'

describe('sansAccents / canoniser', () => {
  it('retire les diacritiques sans casser les lettres', () => {
    expect(sansAccents('protéiforme')).toBe('proteiforme')
    expect(sansAccents('ÉTHÉRÉ')).toBe('ETHERE')
    expect(sansAccents('naïf')).toBe('naif')
    expect(sansAccents('ça')).toBe('ca')
  })

  it('normalise casse, espaces et apostrophes', () => {
    expect(canoniser('  L’Éthéré  ')).toBe("l'ethere")
  })

  it('produit des identifiants stables', () => {
    expect(slug('protéiforme')).toBe('proteiforme')
    expect(slug("s'obstiner")).toBe('s-obstiner')
  })
})

describe('comparerReponse', () => {
  it('accepte la réponse exacte', () => {
    const v = comparerReponse('atavique', 'atavique')
    expect(v).toMatchObject({ correct: true, exact: true, accentManquant: false })
  })

  it("accepte l'accent manquant mais le signale", () => {
    const v = comparerReponse('proteiforme', 'protéiforme')
    expect(v.correct).toBe(true)
    expect(v.exact).toBe(false)
    expect(v.accentManquant).toBe(true)
  })

  it("refuse l'accent manquant en mode strict", () => {
    expect(comparerReponse('proteiforme', 'protéiforme', { accentsStricts: true }).correct).toBe(false)
  })

  it('tolère une coquille sur un mot long', () => {
    const v = comparerReponse('atavque', 'atavique')
    expect(v.correct).toBe(true)
    expect(v.fauteFrappe).toBe(true)
  })

  it('refuse un mot différent', () => {
    expect(comparerReponse('archaïque', 'atavique').correct).toBe(false)
  })

  it('refuse une réponse vide', () => {
    expect(comparerReponse('   ', 'atavique').correct).toBe(false)
  })

  it('ignore la casse', () => {
    expect(comparerReponse('Atavique', 'atavique').correct).toBe(true)
  })
})

describe('distance', () => {
  it('mesure les écarts courts et court-circuite au-delà du plafond', () => {
    expect(distance('chat', 'chat')).toBe(0)
    expect(distance('chat', 'chats')).toBe(1)
    expect(distance('abcdefgh', 'zzz', 3)).toBe(4)
  })
})

describe('melanger', () => {
  it('conserve tous les éléments', () => {
    const source = ['a', 'b', 'c', 'd']
    expect(melanger(source, 12345).sort()).toEqual(source)
  })

  it('est déterministe pour une graine donnée', () => {
    expect(melanger([1, 2, 3, 4, 5], 42)).toEqual(melanger([1, 2, 3, 4, 5], 42))
  })

  it('ne modifie pas le tableau source', () => {
    const source = [1, 2, 3]
    melanger(source, 7)
    expect(source).toEqual([1, 2, 3])
  })
})

describe('decouperCloze', () => {
  it('sépare la phrase autour du marqueur', () => {
    expect(decouperCloze('Son argument est ___ mais séduisant.')).toEqual({
      avant: 'Son argument est ',
      apres: ' mais séduisant.',
    })
  })

  it('renvoie la phrase entière si le marqueur est absent', () => {
    expect(decouperCloze('Aucun trou ici.')).toEqual({ avant: 'Aucun trou ici.', apres: '' })
  })
})
