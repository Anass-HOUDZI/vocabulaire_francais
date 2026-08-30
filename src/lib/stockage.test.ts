import { describe, expect, it } from 'vitest'
import { etatVide, exporterJSON, importerJSON, VERSION_ETAT } from './stockage'
import { creerCarte, planifier } from './srs'
import type { EtatPersiste, LogRevision } from '../types'

const T0 = new Date('2026-03-10T09:00:00').getTime()

function etatRempli(): EtatPersiste {
  const carte = planifier(creerCarte('atavique', T0), 2, T0)
  const log: LogRevision = {
    motId: 'atavique',
    ts: T0,
    note: 2,
    format: 'cloze-qcm',
    etatAvant: 'nouveau',
    joursEcoules: 0,
    intervalleAvant: 0,
    intervalleApres: carte.intervalle,
    msReponse: 4200,
  }
  return {
    ...etatVide(),
    cartes: { atavique: carte },
    logs: [log],
    nouveauxParJourLogique: { '2026-03-10': 1 },
  }
}

describe('export / import', () => {
  it('restitue à l’identique les cartes, les logs et les réglages', () => {
    const avant = etatRempli()
    const apres = importerJSON(exporterJSON(avant))
    expect(apres).not.toBeNull()
    expect(apres!.cartes).toEqual(avant.cartes)
    expect(apres!.logs).toEqual(avant.logs)
    expect(apres!.reglages).toEqual(avant.reglages)
    expect(apres!.nouveauxParJourLogique).toEqual(avant.nouveauxParJourLogique)
  })

  it('conserve les champs nécessaires à un futur planificateur FSRS', () => {
    // Régression volontaire : si l'un de ces champs disparaît du type, l'historique
    // accumulé devient inexploitable et la bascule vers FSRS impossible.
    const log = importerJSON(exporterJSON(etatRempli()))!.logs[0]!
    for (const champ of ['etatAvant', 'joursEcoules', 'intervalleAvant', 'note', 'ts'] as const) {
      expect(log[champ], champ).toBeDefined()
    }
  })

  it('renvoie null sur un fichier illisible, sans lever', () => {
    expect(importerJSON('{ pas du json')).toBeNull()
    expect(importerJSON('[]')).toBeNull()
    expect(importerJSON('{"version":1}')).toBeNull() // pas de clé « cartes »
  })

  it('complète les réglages absents avec les valeurs par défaut', () => {
    const partiel = JSON.stringify({ version: 1, cartes: {}, reglages: { theme: 'dark' } })
    const importe = importerJSON(partiel)
    expect(importe?.reglages.theme).toBe('dark')
    expect(importe?.reglages.nouveauxParJour).toBe(etatVide().reglages.nouveauxParJour)
  })

  it('estampille la version courante', () => {
    expect(importerJSON(exporterJSON(etatRempli()))?.version).toBe(VERSION_ETAT)
  })

  it('ne tronque pas un historique volumineux', () => {
    const gros = etatRempli()
    gros.logs = Array.from({ length: 12_000 }, (_, i) => ({ ...gros.logs[0]!, ts: T0 + i }))
    expect(importerJSON(exporterJSON(gros))?.logs).toHaveLength(12_000)
  })
})
