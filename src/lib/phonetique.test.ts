/**
 * La conversion SAMPA → API est le seul endroit du projet où une erreur produit
 * une prononciation fausse affichée comme sûre. D'où une couverture symbole par
 * symbole, adossée à des mots témoins réellement extraits de Lexique 3.83.
 */

import { describe, expect, it } from 'vitest'
import {
  apiComplete,
  nbSyllabes,
  SAMPA_VERS_API,
  sampaVersApi,
  SEMI_VOYELLES,
  SymboleInconnuError,
  syllabationVersApi,
} from './phonetique'
import * as miroir from '../../scripts/sampa-vers-api.mjs'

const N = String.fromCharCode(0x0303) // tilde combinante

describe('sampaVersApi — voyelles nasales', () => {
  // Ces quatre symboles sont ceux qu'une table recopiée de mémoire confond le
  // plus souvent ; chacun est ancré sur un mot témoin de la base.
  it.each([
    ['@', 'ɑ' + N, 'an / temps'],
    ['5', 'ɛ' + N, 'vin'],
    ['§', 'ɔ' + N, 'on'],
    ['1', 'œ' + N, 'un / brun'],
  ])('%s → %s (%s)', (sampa, attendu) => {
    expect(sampaVersApi(sampa)).toBe(attendu)
  })
})

describe('sampaVersApi — symboles historiquement ambigus', () => {
  it.each([
    ['aNo', 'aɲo', 'agneau — N est la palatale, pas la vélaire'],
    ['paRkiG', 'paʁkiŋ', 'parking — G est la vélaire'],
    ['p2', 'pø', 'peu'],
    ['abat9R', 'abatœʁ', 'abatteur'],
    ['p°ti', 'pəti', 'petit — le e caduc a bien un symbole propre'],
    ['8it', 'ɥit', 'huit'],
    ['Rjoxa', 'ʁjoxa', 'rioja'],
    ['gaR', 'ɡaʁ', 'gare — le g API est U+0261'],
  ])('%s → %s (%s)', (sampa, attendu) => {
    expect(sampaVersApi(sampa)).toBe(attendu)
  })

  it('utilise le g API (U+0261) et non le g latin', () => {
    expect(SAMPA_VERS_API.g).toBe(String.fromCharCode(0x0261))
    expect(SAMPA_VERS_API.g).not.toBe('g')
  })
})

describe('syllabationVersApi', () => {
  it('transcrit la découpe de Lexique en découpe pointée', () => {
    expect(syllabationVersApi('a-ta-vik')).toBe('a.ta.vik')
    expect(syllabationVersApi('fa-la-sj2')).toBe('fa.la.sjø')
    expect(syllabationVersApi('5-si-dj2')).toBe('ɛ' + N + '.si.djø')
  })

  it('encadre la transcription complète de barres obliques', () => {
    expect(apiComplete('a-ta-vik')).toBe('/a.ta.vik/')
  })
})

describe('nbSyllabes — la règle qui fait tout le projet', () => {
  // Ces valeurs viennent de la colonne nbsyll de Lexique 3.83, pas d'un comptage
  // maison. Elles montrent pourquoi le critère « 3 syllabes » doit être
  // phonétique : les quatre mots ci-dessous « ont l'air » trisyllabiques.
  it.each([
    ['a-ta-vik', 3, 'atavique — le e final est muet'],
    ['fa-la-sj2', 3, 'fallacieux — -ieux ne vaut qu\'une syllabe'],
    ['5-si-dj2', 3, 'insidieux'],
    ['Ob-vje', 2, 'obvier — RECALÉ, la semi-voyelle ne crée pas de syllabe'],
  ])('%s vaut %i syllabes (%s)', (syll, attendu) => {
    expect(nbSyllabes(syll)).toBe(attendu)
  })

  it('ne compte jamais une semi-voyelle comme noyau', () => {
    // Une seule syllabe malgré trois « voyelles » orthographiques.
    expect(nbSyllabes('pje')).toBe(1)
    expect(nbSyllabes('wi')).toBe(1)
    expect(nbSyllabes('8it')).toBe(1)
    for (const sv of ['j', 'w', '8']) expect(SEMI_VOYELLES.has(sv)).toBe(true)
  })
})

describe('scripts/sampa-vers-api.mjs — miroir de production', () => {
  // scripts/ n'est pas transpilé : ce script JS pur duplique volontairement la
  // table pour les besoins des scripts de build. Un test qui compare les deux
  // tables terme à terme vaut mieux qu'un commentaire « à garder synchronisé »
  // — la dérive devient une erreur de test, pas un espoir.
  it('couvre exactement les mêmes symboles avec les mêmes valeurs', () => {
    expect(miroir.SAMPA_VERS_API).toEqual(SAMPA_VERS_API)
  })

  it('produit les mêmes transcriptions sur tout le corpus de tests ci-dessus', () => {
    const echantillons = ['a-ta-vik', 'fa-la-sj2', '5-si-dj2', 'aNo', 'paRkiG', 'p°ti', '8it', 'Rjoxa', 'gaR']
    for (const s of echantillons) {
      expect(miroir.syllabationVersApi(s), s).toBe(syllabationVersApi(s))
    }
  })
})

describe('robustesse', () => {
  it('lève sur un symbole inconnu plutôt que de le laisser passer', () => {
    expect(() => sampaVersApi('atavik$')).toThrow(SymboleInconnuError)
    expect(() => sampaVersApi('aQb')).toThrow(/Symbole SAMPA inconnu/)
  })

  it('couvre exactement les 37 symboles présents dans Lexique 3.83', () => {
    expect(Object.keys(SAMPA_VERS_API)).toHaveLength(37)
  })

  it('ne produit aucun symbole SAMPA résiduel en sortie', () => {
    // Aucune majuscule ni chiffre ne doit survivre à la conversion : ce sont les
    // marqueurs d'une table incomplète.
    for (const sampa of Object.keys(SAMPA_VERS_API)) {
      expect(sampaVersApi(sampa), sampa).not.toMatch(/[A-Z0-9@§°]/)
    }
  })

  it('ignore les tirets de découpe dans une conversion brute', () => {
    expect(sampaVersApi('a-ta-vik')).toBe('atavik')
  })
})
