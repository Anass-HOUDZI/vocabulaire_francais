import { useEffect, useRef, useState } from 'react'
import type { Exercice } from '../types'
import { LIBELLE_FORMAT } from '../lib/exercices'
import { comparerReponse, decouperCloze, type Verdict } from '../lib/texte'

const ACCENTS = ['é', 'è', 'ê', 'à', 'â', 'î', 'ï', 'ô', 'û', 'ù', 'ç', 'œ']

export interface Reponse {
  reussi: boolean
  verdict: Verdict
  saisie: string
  ms: number
}

interface Props {
  exercice: Exercice
  accentsStricts: boolean
  /** Appelé une seule fois, à la validation de la réponse. */
  onRepondre: (r: Reponse) => void
  /** Réponse déjà donnée : la carte passe en mode correction, figée. */
  reponse: Reponse | null
}

export default function CarteExercice({ exercice, accentsStricts, onRepondre, reponse }: Props) {
  const [saisie, setSaisie] = useState('')
  const debut = useRef(Date.now())
  const champ = useRef<HTMLInputElement>(null)
  const libre = exercice.options === undefined

  // Réinitialisation à chaque nouvel exercice : sans cela, la saisie de la carte
  // précédente resterait affichée pendant une frame.
  useEffect(() => {
    setSaisie('')
    debut.current = Date.now()
    if (libre) champ.current?.focus()
  }, [exercice.mot.id, exercice.format, libre])

  // Raccourcis clavier : 1–4 pour les options, sans interférer avec la saisie.
  useEffect(() => {
    if (reponse || libre) return
    const onKey = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1
      const options = exercice.options
      if (options && i >= 0 && i < options.length) {
        e.preventDefault()
        valider(options[i] as string)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function valider(valeur: string) {
    if (reponse) return
    const verdict = libre
      ? comparerReponse(valeur, exercice.reponse, { accentsStricts })
      : {
          correct: valeur === exercice.reponse,
          exact: valeur === exercice.reponse,
          accentManquant: false,
          fauteFrappe: false,
        }
    onRepondre({ reussi: verdict.correct, verdict, saisie: valeur, ms: Date.now() - debut.current })
  }

  const { avant, apres } = exercice.support
    ? decouperCloze(exercice.support)
    : { avant: '', apres: '' }

  return (
    <div className="exercice">
      <p className="exercice__etiquette">{LIBELLE_FORMAT[exercice.format]}</p>
      <p className="exercice__consigne">{exercice.consigne}</p>

      {exercice.support && exercice.format === 'cloze-qcm' && (
        <p className="exercice__support" lang="fr">
          {avant}
          <span className={`trou${reponse ? ' trou--rempli' : ''}`}>
            {reponse ? exercice.reponse : '⋯'}
          </span>
          {apres}
        </p>
      )}

      {exercice.support && exercice.format !== 'cloze-qcm' && (
        <p className="exercice__support" lang="fr">
          {exercice.support}
        </p>
      )}

      {!libre && (
        <div className="options" role="group" aria-label="Propositions">
          {exercice.options?.map((opt, i) => {
            let modificateur = ''
            if (reponse) {
              if (opt === exercice.reponse) modificateur = ' option--juste'
              else if (opt === reponse.saisie) modificateur = ' option--faux'
            }
            return (
              <button
                key={opt}
                type="button"
                className={`option${modificateur}`}
                disabled={reponse !== null}
                onClick={() => valider(opt)}
              >
                <span className="option__touche" aria-hidden="true">
                  {reponse && opt === exercice.reponse
                    ? '✓'
                    : reponse && opt === reponse.saisie
                      ? '✕'
                      : i + 1}
                </span>
                <span lang="fr">{opt}</span>
              </button>
            )
          })}
        </div>
      )}

      {libre && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (saisie.trim()) valider(saisie)
          }}
        >
          <label className="visuellement-cache" htmlFor="reponse-libre">
            Votre réponse
          </label>
          <input
            id="reponse-libre"
            ref={champ}
            className="saisie"
            type="text"
            lang="fr"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            value={reponse ? reponse.saisie : saisie}
            disabled={reponse !== null}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="Tapez le mot…"
          />

          {!reponse && (
            <>
              <div className="accents" aria-label="Caractères accentués">
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSaisie((s) => s + c)
                      champ.current?.focus()
                    }}
                    tabIndex={-1}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="btn btn--principal"
                style={{ marginTop: '0.8rem' }}
                disabled={!saisie.trim()}
              >
                Valider
              </button>
            </>
          )}
        </form>
      )}

      {reponse && (
        <p
          className={`verdict ${
            reponse.verdict.exact
              ? 'verdict--juste'
              : reponse.reussi
                ? 'verdict--nuance'
                : 'verdict--faux'
          }`}
          role="status"
        >
          <span aria-hidden="true">{reponse.reussi ? '✓' : '✕'}</span>
          <span>
            {reponse.verdict.exact && 'Exact.'}
            {!reponse.verdict.exact && reponse.verdict.accentManquant && (
              <>
                Accepté, mais l'orthographe exacte est <strong lang="fr">{exercice.reponse}</strong>{' '}
                — attention aux accents.
              </>
            )}
            {!reponse.verdict.exact && reponse.verdict.fauteFrappe && (
              <>
                Accepté malgré une coquille : <strong lang="fr">{exercice.reponse}</strong>.
              </>
            )}
            {!reponse.reussi && (
              <>
                La réponse attendue était <strong lang="fr">{exercice.reponse}</strong>.
              </>
            )}
          </span>
        </p>
      )}
    </div>
  )
}
