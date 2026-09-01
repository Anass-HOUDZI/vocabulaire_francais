/**
 * Contraste WCAG 2.2 sur les tokens de thème.
 *
 * Un contrôle visuel ne tient pas : on ajuste une teinte pour « faire joli », le
 * ratio tombe sous le seuil, et personne ne s'en aperçoit avant qu'un utilisateur
 * ne puisse plus lire les libellés secondaires. Ce test calcule les ratios
 * réels à partir du fichier de tokens, dans les trois configurations (clair,
 * sombre système, sombre explicite).
 *
 * Il vérifie aussi la PARITÉ des jeux de tokens : toute couleur doit être définie
 * dans les trois blocs. Une couleur qui n'existe que dans le bloc clair laisse le
 * thème sombre hériter d'une valeur incohérente — la règle est facile à enfreindre
 * en ajoutant un token à la hâte.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const CSS = readFileSync(new URL('./index.css', import.meta.url), 'utf8')

/** Seuils WCAG 2.2 niveau AA. */
const AA_TEXTE = 4.5
const AA_GRAND_TEXTE = 3.0
const AA_COMPOSANT = 3.0

/* ------------------------------------------------------ extraction CSS */

/**
 * Isole un bloc de déclarations à partir de son sélecteur.
 * Les blocs de tokens ne contiennent aucune accolade imbriquée : s'arrêter à la
 * première accolade fermante est donc exact ici, et volontairement simple.
 */
function bloc(selecteur: string): string {
  const i = CSS.indexOf(selecteur)
  if (i === -1) throw new Error(`Sélecteur introuvable dans index.css : ${selecteur}`)
  const debut = CSS.indexOf('{', i)
  const fin = CSS.indexOf('}', debut)
  return CSS.slice(debut + 1, fin)
}

function tokens(selecteur: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of bloc(selecteur).matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    out[m[1] as string] = (m[2] as string).trim()
  }
  return out
}

const CLAIR = tokens(':root {')
const SOMBRE_SYSTEME = tokens(":root:not([data-theme='light'])")
const SOMBRE_EXPLICITE = tokens(":root[data-theme='dark']")

/* -------------------------------------------------------- calcul WCAG */

function versRgb(couleur: string): [number, number, number] {
  const c = couleur.trim()
  const hex = c.startsWith('#') ? c.slice(1) : null
  if (!hex) throw new Error(`Couleur non hexadécimale, non gérée par ce test : ${couleur}`)
  const plein = hex.length === 3 ? [...hex].map((x) => x + x).join('') : hex
  if (plein.length !== 6) throw new Error(`Hexadécimal mal formé : ${couleur}`)
  return [
    Number.parseInt(plein.slice(0, 2), 16),
    Number.parseInt(plein.slice(2, 4), 16),
    Number.parseInt(plein.slice(4, 6), 16),
  ]
}

/** Luminance relative, formule WCAG 2.x. */
function luminance(couleur: string): number {
  const [r, g, b] = versRgb(couleur).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function ratio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/* ------------------------------------------------------- couples testés */

interface Couple {
  avant: string
  arriere: string
  seuil: number
  usage: string
}

const COUPLES: Couple[] = [
  { avant: 'texte', arriere: 'fond', seuil: AA_TEXTE, usage: 'texte courant sur le fond de page' },
  { avant: 'texte', arriere: 'surface', seuil: AA_TEXTE, usage: 'texte courant sur une carte' },
  { avant: 'texte', arriere: 'surface-2', seuil: AA_TEXTE, usage: 'phrase à trou, options' },
  { avant: 'texte-2', arriere: 'fond', seuil: AA_TEXTE, usage: 'texte secondaire' },
  { avant: 'texte-2', arriere: 'surface', seuil: AA_TEXTE, usage: 'définition, consigne' },
  { avant: 'texte-3', arriere: 'surface', seuil: AA_TEXTE, usage: 'libellés de bloc, en-têtes de tableau' },
  { avant: 'texte-3', arriere: 'surface-2', seuil: AA_TEXTE, usage: 'en-tête de tableau sur fond alterné' },
  { avant: 'accent', arriere: 'fond', seuil: AA_TEXTE, usage: 'liens et surtitres' },
  { avant: 'accent', arriere: 'surface', seuil: AA_TEXTE, usage: 'trou de la phrase à compléter' },
  { avant: 'accent-contraste', arriere: 'accent', seuil: AA_TEXTE, usage: 'libellé du bouton principal' },
  { avant: 'accent-fort', arriere: 'accent-doux', seuil: AA_TEXTE, usage: 'onglet actif, syllabes' },
  { avant: 'succes', arriere: 'succes-doux', seuil: AA_TEXTE, usage: 'verdict juste' },
  { avant: 'erreur', arriere: 'erreur-doux', seuil: AA_TEXTE, usage: 'verdict faux' },
  { avant: 'alerte', arriere: 'alerte-doux', seuil: AA_TEXTE, usage: 'avertissement' },
  { avant: 'info', arriere: 'info-doux', seuil: AA_TEXTE, usage: 'étiquette de difficulté' },
  { avant: 'succes', arriere: 'surface', seuil: AA_TEXTE, usage: 'statistique « mots acquis »' },
  { avant: 'bordure-forte', arriere: 'surface', seuil: AA_COMPOSANT, usage: 'bordure de bouton et de champ' },
  { avant: 'accent', arriere: 'surface-2', seuil: AA_GRAND_TEXTE, usage: 'jauge de progression' },
]

const THEMES: [string, Record<string, string>][] = [
  ['clair', CLAIR],
  ['sombre (système)', SOMBRE_SYSTEME],
  ['sombre (explicite)', SOMBRE_EXPLICITE],
]

/* ------------------------------------------------------------- tests */

describe('parité des jeux de tokens', () => {
  it('définit chaque couleur dans les trois blocs', () => {
    // Les tokens non chromatiques (rayons, polices, largeurs) n'ont pas à être
    // redéfinis en sombre : on ne compare que ce que le bloc sombre déclare.
    const manquantsSysteme = Object.keys(SOMBRE_SYSTEME).filter((k) => !(k in CLAIR))
    const manquantsExplicite = Object.keys(SOMBRE_EXPLICITE).filter((k) => !(k in CLAIR))
    expect(manquantsSysteme, 'tokens présents en sombre système mais absents en clair').toEqual([])
    expect(manquantsExplicite, 'tokens présents en sombre explicite mais absents en clair').toEqual([])
  })

  it('déclare les mêmes tokens dans les deux blocs sombres', () => {
    // Sinon le choix explicite et le mode système ne rendent pas pareil, ce qui
    // est indétectable en développement puisqu'on ne teste jamais les deux.
    expect(Object.keys(SOMBRE_EXPLICITE).sort()).toEqual(Object.keys(SOMBRE_SYSTEME).sort())
  })

  it('donne les mêmes valeurs aux deux blocs sombres', () => {
    for (const [k, v] of Object.entries(SOMBRE_SYSTEME)) {
      expect(SOMBRE_EXPLICITE[k], `token --${k}`).toBe(v)
    }
  })

  it('couvre tous les tokens utilisés par les couples testés', () => {
    const requis = new Set(COUPLES.flatMap((c) => [c.avant, c.arriere]))
    for (const t of requis) {
      expect(CLAIR[t], `--${t} absent du bloc clair`).toBeDefined()
      expect(SOMBRE_SYSTEME[t], `--${t} absent du bloc sombre`).toBeDefined()
    }
  })
})

describe.each(THEMES)('contraste AA — thème %s', (_nom, palette) => {
  it.each(COUPLES)('--$avant sur --$arriere ≥ $seuil ($usage)', ({ avant, arriere, seuil }) => {
    const r = ratio(palette[avant] as string, palette[arriere] as string)
    expect(
      Number(r.toFixed(2)),
      `--${avant} (${palette[avant]}) sur --${arriere} (${palette[arriere]}) : ${r.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(seuil)
  })
})

describe('cohérence du calcul', () => {
  it('donne 21:1 entre noir et blanc, 1:1 pour une couleur avec elle-même', () => {
    expect(ratio('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(ratio('#8a3d2e', '#8a3d2e')).toBeCloseTo(1, 5)
  })

  it('accepte la notation hexadécimale courte', () => {
    expect(ratio('#fff', '#000')).toBeCloseTo(21, 1)
  })
})
