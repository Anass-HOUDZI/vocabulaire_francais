/**
 * Croise une liste de lemmes candidats (proposés à la main ou par un agent)
 * avec Lexique 3.83 : seule la base fait foi pour la phonétique et le compte
 * syllabique — jamais un modèle de langue, jamais une intuition orthographique.
 *
 *   node scripts/verifier-lemmes-lexique.mjs <Lexique383.tsv> <propositions.json> <sortie.json>
 *
 * Entrée attendue (propositions.json) : un tableau d'objets
 *   { mot, categorie: "nom m."|"nom f."|"adjectif"|"verbe"|"adverbe", theme, glose }
 * `glose` et `theme` sont recopiés tels quels dans la sortie, pour la suite du
 * pipeline (rédaction) ; ils ne sont pas vérifiés ici.
 *
 * Sortie : le même tableau, enrichi de `statut` ('valide' | 'absent' | 'rejete'),
 * `motif` le cas échéant, et `lexique: {phon, syll, nbsyll, cgram, freqlemlivres,
 * freqlemfilms2}` pour les entrées valides — ce sous-objet est la seule source
 * de phonétique acceptée par la suite de la chaîne.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const [, , SRC_LEXIQUE, SRC_PROPOSITIONS, DEST] = process.argv
if (!SRC_LEXIQUE || !SRC_PROPOSITIONS || !DEST) {
  console.error('usage: node scripts/verifier-lemmes-lexique.mjs <Lexique383.tsv> <propositions.json> <sortie.json>')
  process.exit(2)
}

const sansAccents = (s) => s.normalize('NFD').replace(/\p{M}/gu, '')
const canoniser = (s) => sansAccents(s).toLowerCase()

// Le fichier distribué par lexique.org est en CRLF.
const lignes = readFileSync(SRC_LEXIQUE, 'utf8').split(/\r?\n/)
const entete = lignes[0].split('\t').map((c) => c.trim())
const col = Object.fromEntries(entete.map((c, i) => [c, i]))

const REQUISES = ['ortho', 'phon', 'lemme', 'cgram', 'genre', 'syll', 'nbsyll', 'nbhomogr', 'islem', 'freqlemlivres', 'freqlemfilms2']
for (const c of REQUISES) {
  if (col[c] === undefined) throw new Error(`Colonne « ${c} » absente : ce fichier n'est pas Lexique 3.83.`)
}

const nombre = (s) => {
  const v = Number.parseFloat(String(s).replace(',', '.'))
  return Number.isFinite(v) ? v : null
}

const CGRAM_ATTENDU = { verbe: 'VER', adjectif: 'ADJ', adverbe: 'ADV', 'nom m.': 'NOM', 'nom f.': 'NOM' }

const parLemme = new Map()
for (let i = 1; i < lignes.length; i++) {
  const l = lignes[i]
  if (!l.trim()) continue
  const c = l.split('\t')
  const ortho = c[col.ortho]
  const cle = canoniser(ortho)
  const entry = {
    ortho,
    cgram: c[col.cgram],
    genre: c[col.genre],
    phon: c[col.phon],
    syll: c[col.syll],
    nbsyll: nombre(c[col.nbsyll]),
    nbhomogr: nombre(c[col.nbhomogr]),
    islem: c[col.islem] === '1',
    freqlemlivres: nombre(c[col.freqlemlivres]),
    freqlemfilms2: nombre(c[col.freqlemfilms2]),
  }
  const existant = parLemme.get(cle)
  if (!existant || (entry.islem && !existant.islem)) parLemme.set(cle, entry)
}

const propositions = JSON.parse(readFileSync(SRC_PROPOSITIONS, 'utf8'))
const resultats = []
const vus = new Set()
const stats = { doublon: 0, absent: 0, syllabes: 0, categorie: 0, homographe: 0, valide: 0 }

for (const p of propositions) {
  const cle = canoniser(p.mot)
  if (vus.has(cle)) { stats.doublon++; continue }

  const l = parLemme.get(cle)
  if (!l) {
    stats.absent++
    resultats.push({ ...p, statut: 'absent', motif: 'introuvable dans Lexique 3.83' })
    continue
  }
  vus.add(cle)

  if (l.nbsyll !== 3) {
    stats.syllabes++
    resultats.push({ ...p, statut: 'rejete', motif: `${l.nbsyll} syllabes réelles (${l.syll}), pas 3`, lexique: { phon: l.phon, syll: l.syll, nbsyll: l.nbsyll } })
    continue
  }
  if (CGRAM_ATTENDU[p.categorie] !== l.cgram) {
    stats.categorie++
    resultats.push({ ...p, statut: 'rejete', motif: `catégorie « ${p.categorie} » ≠ Lexique « ${l.cgram} »`, lexique: { phon: l.phon, syll: l.syll, nbsyll: l.nbsyll, cgram: l.cgram } })
    continue
  }
  if (l.nbhomogr && l.nbhomogr > 1) {
    stats.homographe++
    resultats.push({ ...p, statut: 'rejete', motif: `${l.nbhomogr} homographes dans Lexique — ambigu`, lexique: { phon: l.phon, syll: l.syll, nbsyll: l.nbsyll } })
    continue
  }

  stats.valide++
  resultats.push({
    ...p,
    statut: 'valide',
    ortho: l.ortho,
    genre: l.genre || null,
    lexique: { phon: l.phon, syll: l.syll, nbsyll: l.nbsyll, cgram: l.cgram, freqlemlivres: l.freqlemlivres, freqlemfilms2: l.freqlemfilms2 },
  })
}

writeFileSync(DEST, JSON.stringify(resultats, null, 1), 'utf8')

console.log(`propositions reçues : ${propositions.length}`)
console.log(`doublons            : ${stats.doublon}`)
console.log(`absents de Lexique  : ${stats.absent}`)
console.log(`rejetés — syllabes  : ${stats.syllabes}`)
console.log(`rejetés — catégorie : ${stats.categorie}`)
console.log(`rejetés — homographe: ${stats.homographe}`)
console.log(`VALIDÉS             : ${stats.valide}`)
