/**
 * À partir des lemmes validés par verifier-lemmes-lexique.mjs, produit :
 *  - selection.json  : phonétique (dérivée de Lexique) + difficulté calculée,
 *    prête à être injectée dans le corpus au moment de la fusion ;
 *  - lots.json        : lots thématiques (~35 mots) SANS aucune donnée
 *    phonétique, à transmettre aux agents de rédaction — ils écrivent sur un
 *    mot, jamais sur sa prononciation.
 *
 *   node scripts/preparer-redaction.mjs <verifiees.json> <selection.json> <lots.json> [taille_lot]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { apiComplete, syllabationVersApi } from './sampa-vers-api.mjs'

const [, , SRC, DEST_SELECTION, DEST_LOTS, TAILLE_LOT_ARG] = process.argv
const TAILLE_LOT = Number(TAILLE_LOT_ARG) || 35

const borner = (x) => Math.min(1, Math.max(0, x))
const zipf = (fpm) => Math.log10(Math.max(fpm ?? 0.01, 0.01)) + 3

/**
 * Score de difficulté 1–5, formule décrite dans docs/PLAN.md §4.2.
 *
 * Le poids de l'écart écrit/oral (0.30) est ce qui distingue un mot du
 * registre soutenu d'un mot simplement rare ou régional : sans lui, un
 * filtre par seule fréquence propulse en tête des mots comme « cancoillotte »
 * ou « margoulette », rares mais nullement soutenus.
 *
 * `nblettres`/`nbmorph`/`deflem`/`defobs` ne sont pas disponibles à ce stade
 * du pipeline (ils appartiennent à Lexique mais n'ont pas été conservés lors
 * de la vérification) : leur poids est reporté sur la fréquence et l'écart de
 * registre plutôt que traité comme un signal absent égal à zéro.
 */
function difficulte(mot, freqLivres, freqFilms) {
  const zl = zipf(freqLivres)
  const sFreq = borner((5.0 - zl) / 2.5)
  const sBook = borner((zl - zipf(freqFilms)) / 1.5)
  const sLen = borner((mot.length - 6) / 6)
  const sSyl = 0.5 // toutes les entrées de ce pipeline sont à 3 syllabes
  const sOpac = 0.4 // hypothèse moyenne, faute de nbmorph à ce stade
  const d = 0.45 * sFreq + 0.3 * sBook + 0.05 * sLen + 0.1 * sSyl + 0.1 * sOpac
  return 1 + 4 * d
}
function paliers(score) {
  if (score < 1.8) return 1
  if (score < 2.4) return 2
  if (score < 3.1) return 3
  if (score < 3.8) return 4
  return 5
}

const verifiees = JSON.parse(readFileSync(SRC, 'utf8')).filter((r) => r.statut === 'valide')

const parTheme = new Map()
for (const v of verifiees) {
  if (!parTheme.has(v.theme)) parTheme.set(v.theme, [])
  parTheme.get(v.theme).push(v)
}

const selection = []
const erreursConversion = []

for (const [theme, mots] of parTheme) {
  for (const v of mots) {
    try {
      selection.push({
        mot: v.ortho,
        categorie: v.categorie,
        genre: v.genre,
        api: apiComplete(v.lexique.syll),
        syllabation: syllabationVersApi(v.lexique.syll),
        nbSyllabes: v.lexique.nbsyll,
        difficulte: paliers(difficulte(v.ortho, v.lexique.freqlemlivres, v.lexique.freqlemfilms2)),
        theme: v.theme,
        glose: v.glose,
      })
    } catch (e) {
      erreursConversion.push({ mot: v.ortho, syll: v.lexique.syll, erreur: e.message })
    }
  }
}

writeFileSync(DEST_SELECTION, JSON.stringify(selection, null, 1), 'utf8')

// Lots de rédaction : un thème par lot, sans phonétique. `difficulte` reste
// hors du payload transmis aux agents — ils n'ont pas à s'en soucier, elle est
// déjà tranchée par Lexique et par ce script.
const lots = []
for (const [theme] of parTheme) {
  const sel = selection.filter((s) => s.theme === theme)
  for (let i = 0; i < sel.length; i += TAILLE_LOT) {
    lots.push({
      theme,
      mots: sel.slice(i, i + TAILLE_LOT).map((s) => ({ mot: s.mot, categorie: s.categorie, genre: s.genre, glose: s.glose })),
    })
  }
}
writeFileSync(DEST_LOTS, JSON.stringify(lots), 'utf8')

console.log(`sélection : ${selection.length} mots`)
if (erreursConversion.length) {
  console.log(`erreurs de conversion phonétique : ${erreursConversion.length}`)
  for (const e of erreursConversion) console.log(`  ${e.mot} (${e.syll}) : ${e.erreur}`)
}
console.log(`lots de rédaction : ${lots.length} (max ${TAILLE_LOT} mots/lot)`)
for (const l of lots) console.log(`  ${l.theme.padEnd(38)} ${l.mots.length} mots`)

const parDifficulte = {}
for (const s of selection) parDifficulte[s.difficulte] = (parDifficulte[s.difficulte] ?? 0) + 1
console.log('répartition par difficulté :', JSON.stringify(parDifficulte))
