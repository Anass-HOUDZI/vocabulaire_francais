/**
 * Fusionne la rédaction (contenu, produit par le workflow de rédaction +
 * relecture adversariale) avec selection.json (phonétique et difficulté, dérivées
 * de Lexique par preparer-redaction.mjs), puis insère le résultat dans
 * src/data/corpus.ts, avant les entrées existantes.
 *
 *   node scripts/fusionner-corpus.mjs <selection.json> <redaction.json> <corpus.ts>
 *
 * `redaction.json` est le tableau `entrees` renvoyé par le workflow de
 * rédaction (un objet par mot : definition, exemple, synonymes, antonymes,
 * mesusage, correction, etymologie, cloze). La jointure se fait sur `mot`
 * (insensible aux accents/casse) ; toute entrée sans correspondance dans
 * selection.json est un rejet, jamais une phonétique de repli inventée.
 *
 * Écrit directement dans corpus.ts (insertion avant le crochet fermant) et
 * met à jour le compte dans l'en-tête du fichier.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const [, , SRC_SELECTION, SRC_REDACTION, CORPUS_TS] = process.argv
if (!SRC_SELECTION || !SRC_REDACTION || !CORPUS_TS) {
  console.error('usage: node scripts/fusionner-corpus.mjs <selection.json> <redaction.json> <corpus.ts>')
  process.exit(2)
}

const sansAccents = (s) => s.normalize('NFD').replace(/\p{M}/gu, '')
const canoniser = (s) =>
  sansAccents(s).toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' -]/g, '').replace(/\s+/g, ' ').trim()
const slug = (s) => canoniser(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const typographie = (s) =>
  String(s)
    .replace(/«\s*/g, '« ')
    .replace(/\s*»/g, ' »')
    .replace(/\s+([;:!?])/g, ' $1')
    .replace(/ {2,}/g, ' ')
    .trim()

const selection = JSON.parse(readFileSync(SRC_SELECTION, 'utf8'))
const redaction = JSON.parse(readFileSync(SRC_REDACTION, 'utf8'))
const corpusActuel = readFileSync(CORPUS_TS, 'utf8')

const parMot = new Map(selection.map((s) => [canoniser(s.mot), s]))
const idsExistants = new Set([...corpusActuel.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]))

const alertes = []
const nouveaux = []
const vusId = new Set()

for (const r of redaction) {
  const phon = parMot.get(canoniser(r.mot))
  if (!phon) {
    alertes.push(`REJET « ${r.mot} » — aucune correspondance dans selection.json`)
    continue
  }

  const id = slug(phon.mot)
  if (idsExistants.has(id) || vusId.has(id)) {
    alertes.push(`DOUBLON « ${r.mot} » — id « ${id} » déjà présent dans le corpus, entrée ignorée`)
    continue
  }

  const entree = {
    id,
    mot: phon.mot, // orthographe de Lexique, jamais celle retapée par l'agent rédacteur
    categorie: phon.categorie,
    api: phon.api,
    syllabation: phon.syllabation,
    nbSyllabes: phon.nbSyllabes,
    difficulte: phon.difficulte,
    registre: 'soutenu',
    theme: phon.theme,
    definition: typographie(r.definition),
    exemple: typographie(r.exemple),
    synonymes: r.synonymes,
    antonymes: r.antonymes,
    mesusage: typographie(r.mesusage),
    correction: typographie(r.correction),
    etymologie: typographie(r.etymologie),
    cloze: {
      phrase: typographie(r.cloze.phrase),
      reponse: r.cloze.reponse,
      distracteurs: r.cloze.distracteurs,
    },
  }

  // Contrôles mécaniques avant écriture : les mêmes invariants que
  // src/data/corpus.test.ts, pour échouer ici plutôt qu'en CI.
  if (!entree.cloze.phrase.includes('___')) alertes.push(`CLOZE « ${r.mot} » — pas de marqueur ___`)
  if (new Set(entree.cloze.distracteurs.map(canoniser)).size !== 3) alertes.push(`CLOZE « ${r.mot} » — distracteurs non uniques ou ≠ 3`)
  if (entree.cloze.distracteurs.some((d) => canoniser(d) === canoniser(entree.cloze.reponse))) {
    alertes.push(`CLOZE « ${r.mot} » — un distracteur = la réponse`)
  }
  const racine = canoniser(entree.mot).replace(/^s'/, '').slice(0, 5)
  if (canoniser(entree.definition).includes(racine)) alertes.push(`DÉFINITION « ${r.mot} » — contient le mot défini`)
  if (!canoniser(entree.exemple).includes(racine)) alertes.push(`EXEMPLE « ${r.mot} » — n'emploie pas le mot (vérifier une forme conjuguée irrégulière)`)
  if (!canoniser(entree.cloze.reponse).includes(racine)) alertes.push(`CLOZE « ${r.mot} » — réponse ≠ mot (vérifier une forme conjuguée irrégulière)`)
  if (entree.synonymes.length < 2) alertes.push(`SYNONYMES « ${r.mot} » — moins de 2`)
  if (entree.antonymes.length < 1) alertes.push(`ANTONYMES « ${r.mot} » — aucun`)

  vusId.add(id)
  nouveaux.push(entree)
}

nouveaux.sort((a, b) => a.mot.localeCompare(b.mot, 'fr'))

const q = (s) => JSON.stringify(s)
const arr = (a) => `[${a.map(q).join(', ')}]`

const corps = nouveaux
  .map(
    (m) => `  {
    id: ${q(m.id)},
    mot: ${q(m.mot)},
    categorie: ${q(m.categorie)},
    api: ${q(m.api)},
    syllabation: ${q(m.syllabation)},
    nbSyllabes: ${m.nbSyllabes},
    difficulte: ${m.difficulte},
    registre: ${q(m.registre)},
    theme: ${q(m.theme)},
    definition: ${q(m.definition)},
    exemple: ${q(m.exemple)},
    synonymes: ${arr(m.synonymes)},
    antonymes: ${arr(m.antonymes)},
    mesusage: ${q(m.mesusage)},
    correction: ${q(m.correction)},
    etymologie: ${q(m.etymologie)},
    cloze: {
      phrase: ${q(m.cloze.phrase)},
      reponse: ${q(m.cloze.reponse)},
      distracteurs: ${arr(m.cloze.distracteurs)},
    },
  },`,
  )
  .join('\n')

const fermeture = corpusActuel.lastIndexOf(']')
if (fermeture === -1) throw new Error('crochet fermant du tableau CORPUS introuvable')
let fusionne = corpusActuel.slice(0, fermeture) + corps + '\n' + corpusActuel.slice(fermeture)

const totalApres = idsExistants.size + nouveaux.length
fusionne = fusionne.replace(/\* \d+ entrées, toutes trisyllabiques/, `* ${totalApres} entrées, toutes trisyllabiques`)

writeFileSync(CORPUS_TS, fusionne, 'utf8')

console.log(`entrées ajoutées : ${nouveaux.length} (total : ${totalApres})`)
if (alertes.length) {
  console.log(`\n${alertes.length} alerte(s) — à vérifier une par une, beaucoup sont de fausses alertes sur des`)
  console.log('formes conjuguées irrégulières (radical à 5 caractères trop strict pour requérir/requis, etc.) :')
  for (const a of alertes) console.log('  - ' + a)
} else {
  console.log('Aucune alerte.')
}
