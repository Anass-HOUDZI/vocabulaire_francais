/**
 * Miroir JS pur de src/lib/phonetique.ts, pour les scripts de build Node qui
 * ne passent pas par un transpileur TypeScript.
 *
 * Les deux tables DOIVENT rester identiques : `phonetique.test.ts` couvre la
 * version canonique (src/lib/phonetique.ts) avec 24 tests contre des mots
 * témoins de Lexique 3.83 ; celle-ci n'est qu'un outil de production du
 * corpus et n'a pas sa propre suite de tests. Si l'une change, reporter le
 * changement dans l'autre.
 */
const NASALE = String.fromCharCode(0x0303)

export const SAMPA_VERS_API = {
  a: 'a', e: 'e', E: 'ɛ', i: 'i', o: 'o', O: 'ɔ', u: 'u', y: 'y',
  '2': 'ø', '9': 'œ', '°': 'ə',
  '@': 'ɑ' + NASALE, '5': 'ɛ' + NASALE, '§': 'ɔ' + NASALE, '1': 'œ' + NASALE,
  j: 'j', w: 'w', '8': 'ɥ',
  p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'ɡ', f: 'f', v: 'v',
  s: 's', z: 'z', S: 'ʃ', Z: 'ʒ', m: 'm', n: 'n', N: 'ɲ', G: 'ŋ',
  l: 'l', R: 'ʁ', x: 'x',
}

export function sampaVersApi(sampa) {
  let out = ''
  for (const c of sampa) {
    if (c === '-') continue
    const api = SAMPA_VERS_API[c]
    if (api === undefined) throw new Error(`Symbole SAMPA inconnu « ${c} » dans « ${sampa} »`)
    out += api
  }
  return out
}

export function syllabationVersApi(syll) {
  return syll.split('-').map(sampaVersApi).join('.')
}

export function apiComplete(syll) {
  return `/${syllabationVersApi(syll)}/`
}
