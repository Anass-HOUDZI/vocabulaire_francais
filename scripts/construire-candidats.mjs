/**
 * Sélection des candidats du corpus à partir de Lexique 3.83.
 *
 *   node scripts/construire-candidats.mjs <Lexique383.tsv> <sortie.json>
 *
 * Ce script ne produit JAMAIS de contenu rédactionnel. Il produit une liste de
 * lemmes avec leur phonétique de référence (colonnes `phon`, `syll`, `nbsyll`,
 * `cgram`), leur fréquence et un score de difficulté reproductible. La rédaction
 * — définition, exemple, mésusage — se fait ensuite, et jamais la phonétique.
 *
 * Lexique 3.83 est diffusé sous CC BY-SA 4.0 : citer New, Pallier, Brysbaert &
 * Ferrand (2004). Le partage à l'identique porte sur le jeu de données dérivé,
 * pas sur le code de l'application.
 */

import { readFileSync, writeFileSync } from 'node:fs'

const [, , SRC, DEST] = process.argv
if (!SRC || !DEST) {
  console.error('usage: node scripts/construire-candidats.mjs <Lexique383.tsv> <sortie.json>')
  process.exit(2)
}

/* ------------------------------------------------------------- lecture */

// Le fichier distribué est en CRLF : sans normalisation, la dernière colonne de
// chaque ligne traîne un « \r » qui casse à la fois le nom d'en-tête et la
// valeur numérique correspondante.
const lignes = readFileSync(SRC, 'utf8').split(/\r?\n/)
const entete = lignes[0].split('\t').map((c) => c.trim())
const col = Object.fromEntries(entete.map((c, i) => [c, i]))

const REQUISES = ['ortho', 'phon', 'lemme', 'cgram', 'freqlemfilms2', 'freqlemlivres', 'islem', 'nblettres', 'nbhomogr', 'syll', 'nbsyll', 'deflem', 'defobs', 'nbmorph', 'genre']
for (const c of REQUISES) {
  if (col[c] === undefined) throw new Error(`Colonne « ${c} » absente : ce fichier n'est pas Lexique 3.83.`)
}

const nombre = (s) => {
  const v = Number.parseFloat(String(s).replace(',', '.'))
  return Number.isFinite(v) ? v : null
}

/* --------------------------------------------------------- difficulté */

const borner = (x) => Math.min(1, Math.max(0, x))

/** Échelle Zipf : log10(occurrences par million) + 3. Zipf 1–3 rare, 5–7 courant. */
const zipf = (fpm) => Math.log10(Math.max(fpm ?? 0, 0.01)) + 3

/**
 * Écart écrit/oral, en points Zipf. C'est le seul signal de REGISTRE que porte
 * Lexique : un mot bien plus fréquent dans les livres que dans les sous-titres
 * est un mot d'écrit. Un mot rare des deux côtés est simplement rare —
 * régional, familier ou technique.
 */
const ecartRegistre = (r) => zipf(r.freqlemlivres) - zipf(r.freqlemfilms2)

/**
 * Score de difficulté 1–5.
 *
 * Pondération révisée après examen de la sortie : la version initiale plaçait en
 * tête « cancoillotte », « badigoinces » et « tartignolle », c'est-à-dire des
 * mots rares mais nullement soutenus. Deux corrections :
 *   – le poids de l'écart écrit/oral passe de 0.15 à 0.30, car c'est lui qui
 *     distingue « hérésiarque » de « rouspétance » ;
 *   – le poids de la longueur tombe de 0.15 à 0.05 : c'était un mauvais indice,
 *     qui favorisait mécaniquement les mots familiers longs.
 *
 * `deflem` (part de sujets déclarant connaître le lemme) ne couvre qu'un
 * sous-ensemble de la base : quand `defobs` est trop faible pour être fiable, son
 * poids est redistribué sur la rareté plutôt que traité comme un zéro, ce qui
 * ferait passer pour faciles les mots simplement non testés.
 */
export function difficulte(r) {
  const zl = zipf(r.freqlemlivres)

  const sFreq = borner((5.0 - zl) / 2.5)
  const sBook = borner(ecartRegistre(r) / 1.5)
  const sLen = borner((r.nblettres - 6) / 6)
  const sSyl = borner((r.nbsyll - 2) / 2)
  const sOpac = r.nbmorph !== null && r.nbmorph <= 1 ? 1.0 : 0.4

  const fiable = r.defobs !== null && r.defobs >= 20 && r.deflem !== null
  const poidsConnu = fiable ? 0.1 : 0
  const sConnu = fiable ? 1 - r.deflem : 0

  const d =
    (0.35 + (0.1 - poidsConnu)) * sFreq +
    0.3 * sBook +
    0.05 * sLen +
    0.1 * sSyl +
    0.1 * sOpac +
    poidsConnu * sConnu

  return 1 + 4 * d
}

/** Seuils documentés dans docs/PLAN.md §4.2. */
export function paliers(score) {
  if (score < 1.8) return 1
  if (score < 2.4) return 2
  if (score < 3.1) return 3
  if (score < 3.8) return 4
  return 5
}

/* ------------------------------------------------------------ filtres */

const CGRAM_UTILES = new Set(['NOM', 'ADJ', 'VER', 'ADV'])
const LETTRES_FR = /^[a-zàâäéèêëîïôöùûüÿçœæ]+$/

/**
 * Écart écrit/oral minimal, en points Zipf.
 *
 * Filtre dur, et non simple pondération : sans lui, la moitié du haut de liste
 * est faite de mots régionaux et familiers (« cancoillotte », « margoulette »)
 * que leur seule rareté propulse en tête. Un mot du registre intellectuel est
 * nettement plus écrit que parlé.
 */
const ECART_REGISTRE_MIN = 0.45

/** Mots déjà présents dans le corpus, à ne pas re-proposer. */
const DEJA_PRESENTS = new Set(
  (process.env.CORPUS_EXISTANT ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
)

const rejets = { cgram: 0, syllabes: 0, frequence: 0, longueur: 0, homographe: 0, forme: 0, nonLemme: 0, registre: 0, difficulte: 0, deja: 0 }
const candidats = []

for (let i = 1; i < lignes.length; i++) {
  const l = lignes[i]
  if (!l.trim()) continue
  const c = l.split('\t')

  const r = {
    ortho: c[col.ortho],
    phon: c[col.phon],
    lemme: c[col.lemme],
    cgram: c[col.cgram],
    genre: c[col.genre],
    syll: c[col.syll],
    nbsyll: nombre(c[col.nbsyll]),
    nblettres: nombre(c[col.nblettres]),
    nbhomogr: nombre(c[col.nbhomogr]),
    nbmorph: nombre(c[col.nbmorph]),
    freqlemlivres: nombre(c[col.freqlemlivres]),
    freqlemfilms2: nombre(c[col.freqlemfilms2]),
    deflem: nombre(c[col.deflem]),
    defobs: nombre(c[col.defobs]),
  }

  if (c[col.islem] !== '1') { rejets.nonLemme++; continue }
  if (!CGRAM_UTILES.has(r.cgram)) { rejets.cgram++; continue }
  if (r.nbsyll !== 3) { rejets.syllabes++; continue }
  if (!LETTRES_FR.test(r.ortho)) { rejets.forme++; continue }
  if (r.nblettres === null || r.nblettres < 7) { rejets.longueur++; continue }
  if (r.nbhomogr !== 1) { rejets.homographe++; continue }
  if (r.freqlemlivres === null || r.freqlemlivres < 0.05 || r.freqlemlivres > 3.0) { rejets.frequence++; continue }
  if (DEJA_PRESENTS.has(r.ortho.toLowerCase())) { rejets.deja++; continue }
  if (ecartRegistre(r) < ECART_REGISTRE_MIN) { rejets.registre++; continue }

  const score = difficulte(r)
  if (score < 3.0) { rejets.difficulte++; continue }

  candidats.push({
    mot: r.ortho,
    lemme: r.lemme,
    cgram: r.cgram,
    genre: r.genre || null,
    phon: r.phon,
    syll: r.syll,
    nbsyll: r.nbsyll,
    freqLivres: r.freqlemlivres,
    freqFilms: r.freqlemfilms2,
    zipfLivres: Number(zipf(r.freqlemlivres).toFixed(2)),
    ecartRegistre: Number(ecartRegistre(r).toFixed(2)),
    score: Number(score.toFixed(2)),
    difficulte: paliers(score),
  })
}

// Dédoublonnage par lemme : on garde la forme la plus difficile.
const parLemme = new Map()
for (const c of candidats) {
  const p = parLemme.get(c.lemme)
  if (!p || c.score > p.score) parLemme.set(c.lemme, c)
}

const retenus = [...parLemme.values()].sort((a, b) => b.score - a.score)

writeFileSync(DEST, JSON.stringify(retenus, null, 1), 'utf8')

/* ------------------------------------------------------- diagnostics */

console.log(`lignes lues            : ${lignes.length - 1}`)
console.log(`candidats retenus      : ${retenus.length}  (${parLemme.size} lemmes distincts)`)
console.log('\nrejets par filtre :')
for (const [k, v] of Object.entries(rejets)) console.log(`  ${k.padEnd(12)} ${v}`)

const parCgram = {}
const parDiff = {}
for (const c of retenus) {
  parCgram[c.cgram] = (parCgram[c.cgram] ?? 0) + 1
  parDiff[c.difficulte] = (parDiff[c.difficulte] ?? 0) + 1
}
console.log('\npar catégorie :', JSON.stringify(parCgram))
console.log('par difficulté :', JSON.stringify(parDiff))
console.log('\n30 plus difficiles :')
console.log('  ' + retenus.slice(0, 30).map((c) => `${c.mot}(${c.score})`).join(' '))
console.log('\n30 autour du seuil :')
console.log('  ' + retenus.slice(-30).map((c) => `${c.mot}(${c.score})`).join(' '))
