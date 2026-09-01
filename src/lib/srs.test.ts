/**
 * Le planificateur est la seule partie de l'application dont une régression est
 * invisible à l'œil : une carte mal programmée revient dans six mois au lieu de
 * demain, et on ne s'en aperçoit qu'à ce moment-là. D'où des tests unitaires ici,
 * et nulle part ailleurs au MVP.
 */

import { describe, expect, it } from 'vitest'
import {
  calculerStatistiques,
  creerCarte,
  fileDuJour,
  formaterDelai,
  jourLogique,
  JOUR_MS,
  MINUTE_MS,
  planifier,
  prochaineEcheance,
  SEUIL_MATURITE,
} from './srs'
import type { Carte, LogRevision } from '../types'

const T0 = new Date('2026-03-10T09:00:00').getTime()

function carteEnRevision(intervalle: number, facilite = 2.5): Carte {
  return {
    ...creerCarte('mot', T0),
    etat: 'revision',
    intervalle,
    facilite,
    du: T0,
    reussites: 5,
  }
}

describe('planifier', () => {
  it("place une carte neuve au premier palier d'apprentissage", () => {
    const c = planifier(creerCarte('m', T0), 2, T0)
    expect(c.etat).toBe('apprentissage')
    expect(c.etape).toBe(1)
    expect(c.du).toBe(T0 + 10 * MINUTE_MS)
  })

  it("diplôme une carte neuve notée « facile » directement en révision", () => {
    const c = planifier(creerCarte('m', T0), 3, T0)
    expect(c.etat).toBe('revision')
    expect(c.intervalle).toBe(4)
    expect(c.du).toBe(T0 + 4 * JOUR_MS)
  })

  it('fait piétiner « difficile » sur le palier courant', () => {
    const depart = { ...creerCarte('m', T0), etat: 'apprentissage' as const, etape: 1 }
    const c = planifier(depart, 1, T0)
    expect(c.etat).toBe('apprentissage')
    expect(c.etape).toBe(1)
    expect(c.du).toBe(T0 + 10 * MINUTE_MS)
  })

  it("diplôme après le dernier palier d'apprentissage", () => {
    const depart = { ...creerCarte('m', T0), etat: 'apprentissage' as const, etape: 1 }
    const c = planifier(depart, 2, T0)
    expect(c.etat).toBe('revision')
    expect(c.intervalle).toBe(1)
  })

  it('multiplie l’intervalle par la facilité en révision réussie', () => {
    const c = planifier(carteEnRevision(10, 2.5), 2, T0)
    expect(c.etat).toBe('revision')
    expect(c.intervalle).toBe(25)
    expect(c.facilite).toBe(2.5)
  })

  it('applique un facteur réduit sur « difficile » et baisse la facilité', () => {
    const c = planifier(carteEnRevision(10, 2.5), 1, T0)
    expect(c.intervalle).toBe(12)
    expect(c.facilite).toBeCloseTo(2.35, 5)
  })

  it('applique le bonus sur « facile »', () => {
    const c = planifier(carteEnRevision(10, 2.5), 3, T0)
    expect(c.facilite).toBeCloseTo(2.65, 5)
    expect(c.intervalle).toBe(Math.round(10 * 2.65 * 1.3))
  })

  it('fait rechuter une carte oubliée sans effacer son intervalle', () => {
    const c = planifier(carteEnRevision(40), 0, T0)
    expect(c.etat).toBe('rechute')
    expect(c.rechutes).toBe(1)
    expect(c.intervalle).toBe(16) // 40 × 0.4
    expect(c.du).toBe(T0 + 10 * MINUTE_MS)
    expect(c.facilite).toBeCloseTo(2.3, 5)
  })

  it('borne la facilité au plancher malgré les échecs répétés', () => {
    let c = carteEnRevision(5, 1.35)
    for (let i = 0; i < 5; i++) c = planifier(c, 0, T0)
    expect(c.facilite).toBe(1.3)
  })

  it("plafonne l'intervalle à un an", () => {
    const c = planifier(carteEnRevision(300), 3, T0)
    expect(c.intervalle).toBe(365)
  })

  it('ne mute jamais la carte passée en argument', () => {
    const avant = carteEnRevision(10)
    const copie = { ...avant }
    planifier(avant, 0, T0)
    expect(avant).toEqual(copie)
  })

  it('remet une carte en rechute sur le rail après réussite', () => {
    const rechutee = planifier(carteEnRevision(40), 0, T0)
    const reprise = planifier(rechutee, 2, T0 + 10 * MINUTE_MS)
    expect(reprise.etat).toBe('revision')
    expect(reprise.intervalle).toBe(16)
  })
})

describe('jourLogique', () => {
  it('rattache 2 h du matin à la veille', () => {
    const veille = jourLogique(new Date('2026-03-10T02:30:00').getTime())
    const midiVeille = jourLogique(new Date('2026-03-09T12:00:00').getTime())
    expect(veille).toBe(midiVeille)
  })

  it('bascule à 4 h', () => {
    const avant = jourLogique(new Date('2026-03-10T03:59:00').getTime())
    const apres = jourLogique(new Date('2026-03-10T04:01:00').getTime())
    expect(avant).not.toBe(apres)
    expect(apres).toBe('2026-03-10')
  })
})

describe('fileDuJour', () => {
  const options = { nouveauxRestants: 2, maxParSession: 10 }

  it('priorise l’apprentissage, puis les révisions, puis les nouveaux', () => {
    const cartes: Carte[] = [
      { ...creerCarte('nouveau-1', T0) },
      { ...creerCarte('nouveau-2', T0) },
      { ...carteEnRevision(5), motId: 'revision-1', du: T0 - JOUR_MS },
      { ...creerCarte('appr-1', T0), etat: 'apprentissage', du: T0 - MINUTE_MS },
    ]
    const file = fileDuJour(cartes, T0, options)
    expect(file.map((c) => c.motId)).toEqual(['appr-1', 'revision-1', 'nouveau-1', 'nouveau-2'])
  })

  it('exclut les cartes non échues et les cartes suspendues', () => {
    const cartes: Carte[] = [
      { ...carteEnRevision(5), motId: 'plus-tard', du: T0 + JOUR_MS },
      { ...carteEnRevision(5), motId: 'ecartee', du: T0 - JOUR_MS, suspendue: true },
    ]
    expect(fileDuJour(cartes, T0, options)).toHaveLength(0)
  })

  it('respecte le quota de nouveaux et le plafond de session', () => {
    const cartes = Array.from({ length: 40 }, (_, i) => creerCarte(`n${i}`, T0))
    expect(fileDuJour(cartes, T0, { nouveauxRestants: 3, maxParSession: 10 })).toHaveLength(3)

    const dues = Array.from({ length: 40 }, (_, i) => ({
      ...carteEnRevision(5),
      motId: `r${i}`,
      du: T0 - JOUR_MS,
    }))
    expect(fileDuJour(dues, T0, { nouveauxRestants: 3, maxParSession: 10 })).toHaveLength(10)
  })
})

describe('prochaineEcheance', () => {
  it('renvoie la carte échue le plus tôt', () => {
    const cartes: Carte[] = [
      { ...carteEnRevision(5), motId: 'dans-3j', du: T0 + 3 * JOUR_MS },
      { ...carteEnRevision(5), motId: 'demain', du: T0 + JOUR_MS },
    ]
    expect(prochaineEcheance(cartes, T0)).toBe(T0 + JOUR_MS)
  })

  it('ignore les cartes déjà dues, neuves ou suspendues', () => {
    const cartes: Carte[] = [
      { ...carteEnRevision(5), motId: 'deja-due', du: T0 - JOUR_MS },
      { ...creerCarte('neuve', T0) },
      { ...carteEnRevision(5), motId: 'ecartee', du: T0 + JOUR_MS, suspendue: true },
    ]
    expect(prochaineEcheance(cartes, T0)).toBeNull()
  })

  it('renvoie null sur un jeu vide', () => {
    expect(prochaineEcheance([], T0)).toBeNull()
  })
})

describe('calculerStatistiques', () => {
  it('sépare les cartes jeunes des cartes matures', () => {
    const cartes = [carteEnRevision(SEUIL_MATURITE - 1), carteEnRevision(SEUIL_MATURITE)]
    const s = calculerStatistiques(cartes, [], T0)
    expect(s.jeunes).toBe(1)
    expect(s.matures).toBe(1)
  })

  it('ignore les premières présentations dans le taux de rappel', () => {
    const logs: LogRevision[] = [
      { motId: 'a', ts: T0 - JOUR_MS, note: 0, format: 'cloze-qcm', etatAvant: 'nouveau', joursEcoules: 0, intervalleAvant: 0, intervalleApres: 0, msReponse: 1 },
      { motId: 'b', ts: T0 - JOUR_MS, note: 2, format: 'cloze-qcm', etatAvant: 'revision', joursEcoules: 5, intervalleAvant: 5, intervalleApres: 12, msReponse: 1 },
      { motId: 'c', ts: T0 - JOUR_MS, note: 0, format: 'cloze-qcm', etatAvant: 'revision', joursEcoules: 6, intervalleAvant: 5, intervalleApres: 2, msReponse: 1 },
    ]
    const s = calculerStatistiques([], logs, T0)
    expect(s.retention30j).toBe(0.5) // seuls b et c comptent
  })

  it('renvoie null quand aucune révision n’est exploitable', () => {
    expect(calculerStatistiques([], [], T0).retention30j).toBeNull()
  })

  it('compte la série de jours consécutifs sans exiger une révision aujourd’hui', () => {
    const logs: LogRevision[] = [1, 2, 3].map((d) => ({
      motId: 'a',
      ts: T0 - d * JOUR_MS,
      note: 2,
      format: 'cloze-qcm' as const,
      etatAvant: 'revision' as const,
      joursEcoules: 5,
      intervalleAvant: 5,
      intervalleApres: 10,
      msReponse: 1,
    }))
    expect(calculerStatistiques([], logs, T0).serie).toBe(3)
  })
})

describe('formaterDelai', () => {
  it('choisit une unité lisible', () => {
    expect(formaterDelai(MINUTE_MS)).toBe('1 min')
    expect(formaterDelai(3 * 60 * MINUTE_MS)).toBe('3 h')
    expect(formaterDelai(5 * JOUR_MS)).toBe('5 j')
    expect(formaterDelai(60 * JOUR_MS)).toBe('2 mois')
    expect(formaterDelai(365 * JOUR_MS)).toBe('1.0 an')
  })
})
