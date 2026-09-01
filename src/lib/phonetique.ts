/**
 * Conversion SAMPA (Lexique 3.83) → alphabet phonétique international.
 *
 * Règle du projet : **la phonétique ne se génère jamais**. Les colonnes `phon`,
 * `syll`, `nbsyll` et `cgram` de Lexique font foi ; ce module se contente de les
 * transcrire. C'est la seule façon d'avoir une prononciation juste sans confier à
 * un modèle de langue une tâche qu'il exécute de façon plausible mais fausse.
 *
 * La table ci-dessous n'a pas été recopiée d'un mémento : chaque symbole a été
 * résolu contre des mots témoins de la base elle-même —
 * `an`=@, `on`=§, `un`=1, `vin`=v5, `agneau`=aNo, `parking`=paRkiG,
 * `peu`=p2, `abatteur`=abat9R, `petit`=p°ti, `huit`=8it, `rioja`=Rjoxa.
 *
 * Vérification préalable sur les 142 694 entrées de Lexique 3.83 :
 * `syll` est exactement `phon` découpé par des tirets, et `nbsyll` vaut toujours
 * le nombre de segments — zéro désaccord. On ne recompte donc jamais les
 * syllabes soi-même : on découpe `syll`.
 *
 * Réserve honnête : Lexique n'applique pas uniformément la loi de position sur
 * l'opposition /ø/ ~ /œ/ (`peur` y vaut `p2R` quand `abatteur` vaut `abat9R`).
 * La conversion reste fidèle à la source plutôt que de « corriger » en silence
 * une base de référence.
 */

/**
 * Tilde combinante U+0303, marque de nasalité.
 *
 * Construite par code plutôt qu'écrite littéralement : le caractère est
 * invisible dans un éditeur, se colle silencieusement au signe précédent lors
 * d'un copier-coller, et disparaît à un enregistrement en latin-1.
 */
const NASALE = String.fromCharCode(0x0303)

/**
 * Table SAMPA → API. Couvre les 37 symboles effectivement présents dans
 * Lexique 3.83, ni plus ni moins.
 */
export const SAMPA_VERS_API: Readonly<Record<string, string>> = {
  // Voyelles orales
  a: 'a',
  e: 'e',
  E: 'ɛ', // ɛ
  i: 'i',
  o: 'o',
  O: 'ɔ', // ɔ
  u: 'u',
  y: 'y',
  '2': 'ø', // ø
  '9': 'œ', // œ
  '°': 'ə', // ° → ə

  // Voyelles nasales
  '@': 'ɑ' + NASALE, // ɑ̃
  '5': 'ɛ' + NASALE, // ɛ̃
  '§': 'ɔ' + NASALE, // § → ɔ̃
  '1': 'œ' + NASALE, // œ̃

  // Semi-voyelles — ne forment jamais de noyau syllabique
  j: 'j',
  w: 'w',
  '8': 'ɥ', // ɥ

  // Consonnes
  p: 'p',
  b: 'b',
  t: 't',
  d: 'd',
  k: 'k',
  g: 'ɡ', // ɡ (U+0261, pas le « g » latin)
  f: 'f',
  v: 'v',
  s: 's',
  z: 'z',
  S: 'ʃ', // ʃ
  Z: 'ʒ', // ʒ
  m: 'm',
  n: 'n',
  N: 'ɲ', // ɲ
  G: 'ŋ', // ŋ
  l: 'l',
  R: 'ʁ', // ʁ
  x: 'x',
}

/** Les trois semi-voyelles : jamais un noyau, donc jamais une syllabe. */
export const SEMI_VOYELLES: ReadonlySet<string> = new Set(['j', 'w', '8'])

export class SymboleInconnuError extends Error {
  constructor(
    readonly symbole: string,
    readonly source: string,
  ) {
    super(`Symbole SAMPA inconnu « ${symbole} » dans « ${source} »`)
    this.name = 'SymboleInconnuError'
  }
}

/**
 * Transcrit une chaîne SAMPA en API.
 *
 * Lève sur un symbole inconnu plutôt que de le laisser passer : une transcription
 * silencieusement incomplète produirait une prononciation fausse affichée comme
 * sûre, ce qui est pire que l'absence de fiche.
 */
export function sampaVersApi(sampa: string): string {
  let out = ''
  for (const c of sampa) {
    if (c === '-') continue
    const api = SAMPA_VERS_API[c]
    if (api === undefined) throw new SymboleInconnuError(c, sampa)
    out += api
  }
  return out
}

/**
 * Transcrit la colonne `syll` de Lexique (`a-ta-vik`) en découpe API pointée
 * (`a.ta.vik`), format attendu par `Mot.syllabation`.
 */
export function syllabationVersApi(syll: string): string {
  return syll
    .split('-')
    .map((s) => sampaVersApi(s))
    .join('.')
}

/** Transcription complète encadrée par des barres obliques, format `Mot.api`. */
export function apiComplete(syll: string): string {
  return `/${syllabationVersApi(syll)}/`
}

/**
 * Nombre de syllabes, lu sur la découpe fournie par Lexique.
 *
 * On ne le recalcule pas depuis les phonèmes : `nbsyll` et `syll` sont cohérents
 * sur l'intégralité de la base, et tout recomptage maison réintroduirait
 * précisément les deux pièges qu'on cherche à éviter — compter les semi-voyelles
 * comme noyaux et compter le e caduc final.
 */
export function nbSyllabes(syll: string): number {
  return syll.split('-').length
}
