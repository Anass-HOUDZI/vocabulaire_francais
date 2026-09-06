import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LEXIQUE, PAR_ID } from '../data/lexique'
import { useApp } from '../store/AppContext'
import { useSynthese } from '../hooks/useSynthese'
import { apercuIntervalles, fileDuJour, formaterDelai, prochaineEcheance } from '../lib/srs'
import { construireExercice } from '../lib/exercices'
import { LIBELLE_NOTE, type Note } from '../types'
import CarteExercice, { type Reponse } from './CarteExercice'
import FicheMot from './FicheMot'

/**
 * Correspondance résultat d'exercice → notes proposées.
 *
 * Une réponse fausse ne peut pas être notée « Facile » : laisser ce bouton
 * accessible permettrait de saboter silencieusement le planificateur. On offre
 * malgré tout deux nuances de chaque côté, pour distinguer « je ne savais pas
 * du tout » de « j'hésitais » — c'est ce qui fait la valeur du signal SRS par
 * rapport à un simple binaire juste/faux.
 */
const NOTES_SI_JUSTE: Note[] = [1, 2, 3]
const NOTES_SI_FAUX: Note[] = [0, 1]
const NOTES_PRESENTATION: Note[] = [0, 2, 3]

/** Nombre maximum de repassages d'une même carte dans une seule session. */
const MAX_REPASSAGES = 2

export default function Reviser({
  onOuvrirLexique,
  limiteInitiale,
}: {
  onOuvrirLexique: () => void
  limiteInitiale?: number
}) {
  const { etat, noter, suspendre, nouveauxRestants } = useApp()
  const synthese = useSynthese(etat.reglages.debitVoix)

  const [file, setFile] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [reponse, setReponse] = useState<Reponse | null>(null)
  const [bilan, setBilan] = useState({ vus: 0, justes: 0 })
  const [demarree, setDemarree] = useState(false)
  const repassages = useRef<Record<string, number>>({})

  /** fileDuJour sera appelé au montage pour démarrer la session */

  const demarrer = useCallback(
    (limiteNouveaux?: number) => {
      const cartes = Object.values(etat.cartes)
      const selection = fileDuJour(cartes, Date.now(), {
        nouveauxRestants:
          limiteNouveaux === undefined ? nouveauxRestants : Math.min(limiteNouveaux, nouveauxRestants),
        maxParSession: etat.reglages.maxParSession,
      })
      repassages.current = {}
      setFile(selection.map((c) => c.motId))
      setIndex(0)
      setReponse(null)
      setBilan({ vus: 0, justes: 0 })
      setDemarree(true)
      // `etat.cartes` est volontairement absent des dépendances : la file est
      // figée au démarrage de la session, sinon chaque notation la recalculerait
      // et ferait sauter la carte courante.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [etat.reglages.maxParSession, nouveauxRestants],
  )

  useEffect(() => {
    demarrer(limiteInitiale)
    // Une seule construction de file au montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const motId = file[index]
  const carte = motId ? etat.cartes[motId] : undefined
  const mot = motId ? PAR_ID.get(motId) : undefined

  const exercice = useMemo(
    () => (carte && mot ? construireExercice(carte, mot, LEXIQUE) : null),
    [carte, mot],
  )

  const apercu = useMemo(
    () => (carte ? apercuIntervalles(carte, Date.now()) : null),
    [carte],
  )

  const notesDisponibles: Note[] = !carte
    ? []
    : carte.etat === 'nouveau'
      ? NOTES_PRESENTATION
      : reponse
        ? reponse.reussi
          ? NOTES_SI_JUSTE
          : NOTES_SI_FAUX
        : []

  const enregistrer = useCallback(
    (note: Note) => {
      if (!motId || !carte) return
      noter(motId, note, exercice?.format ?? 'mot-vers-definition', reponse?.ms ?? 0)

      setBilan((b) => ({
        vus: b.vus + 1,
        justes: b.justes + (note > 0 ? 1 : 0),
      }))

      // Une carte oubliée revient en fin de session : la revoir dans dix minutes
      // n'a de sens que si la session dure encore.
      const nb = repassages.current[motId] ?? 0
      if (note === 0 && nb < MAX_REPASSAGES) {
        repassages.current[motId] = nb + 1
        setFile((f) => [...f, motId])
      }

      if (note === 3) {
        import('canvas-confetti').then((m) => {
          m.default({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500'] })
        })
        import('../lib/sounds').then((m) => m.playSound('perfect'))
      }

      setReponse(null)
      setIndex((i) => i + 1)
    },
    [motId, carte, noter, exercice, reponse],
  )

  const [guideVu, setGuideVu] = useState(() => {
    try {
      return localStorage.getItem('lexique_guide_vu') === '1'
    } catch {
      return false
    }
  })

  // Raccourcis 1–4 pour la notation, et Espace pour la validation rapide.
  useEffect(() => {
    if (!notesDisponibles.length) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        const noteDefaut = notesDisponibles.includes(2) ? 2 : notesDisponibles[0]
        if (noteDefaut !== undefined) {
          enregistrer(noteDefaut)
          return
        }
      }

      const i = Number(e.key) - 1
      const note = notesDisponibles[i]
      if (note !== undefined) {
        e.preventDefault()
        enregistrer(note)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [notesDisponibles, enregistrer])

  const [zen, setZen] = useState(false)

  // Mode Zen : bascule de la classe body et raccourcis clavier Z / Échap
  useEffect(() => {
    document.body.classList.toggle('mode-zen', zen)
    return () => {
      document.body.classList.remove('mode-zen')
    }
  }, [zen])

  useEffect(() => {
    const onKeyZen = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault()
        setZen((z) => !z)
      } else if (e.key === 'Escape' && zen) {
        e.preventDefault()
        setZen(false)
      }
    }
    window.addEventListener('keydown', onKeyZen)
    return () => window.removeEventListener('keydown', onKeyZen)
  }, [zen])

  // Lecture automatique du mot à la correction ou à la découverte, si l'utilisateur l'a demandé.
  useEffect(() => {
    if (etat.reglages.audioAuto && mot && (reponse || carte?.etat === 'nouveau')) {
      synthese.parler(mot.mot)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reponse, mot?.id, carte?.etat])

  /* ----------------------------------------------------------- Rendus */

  if (!demarree) {
    return null
  }

  if (!file.length) {
    const echeance = prochaineEcheance(Object.values(etat.cartes), Date.now())
    return (
      <div className="carte vide">
        <p className="vide__icone" aria-hidden="true">
          ✻
        </p>
        <h2>Rien à réviser pour le moment</h2>
        <p>
          {echeance !== null ? (
            <>
              Prochaine carte à revoir dans <strong>{formaterDelai(echeance - Date.now())}</strong>.
            </>
          ) : (
            <>Aucune carte n'est programmée.</>
          )}
          {nouveauxRestants === 0 && (
            <>
              {' '}
              Votre quota de mots nouveaux est épuisé pour aujourd'hui.
            </>
          )}
        </p>
        <p className="vide__astuce">
          C'est le fonctionnement normal de la répétition espacée : réviser plus tôt qu'il ne faut
          n'améliore pas la mémorisation, cela ne fait qu'alourdir les jours suivants. Pour avancer
          plus vite, relevez le quota quotidien dans les réglages — en connaissance de cause.
        </p>
        <div className="vide__actions">
          <button type="button" className="btn" onClick={onOuvrirLexique}>
            Parcourir le lexique
          </button>
        </div>
      </div>
    )
  }

  if (index >= file.length || !mot || !carte) {
    const taux = bilan.vus ? Math.round((bilan.justes / bilan.vus) * 100) : 0
    return (
      <div className="carte vide">
        <p className="vide__icone" aria-hidden="true">
          ✓
        </p>
        <h2>Session terminée</h2>
        <p>
          {bilan.vus} carte{bilan.vus > 1 ? 's' : ''} revue{bilan.vus > 1 ? 's' : ''}, {taux} % de
          rappel réussi.
        </p>
        <div className="vide__actions">
          {/* Sans la lambda, l'événement de clic partirait en `limiteNouveaux`. */}
          <button type="button" className="btn btn--principal" onClick={() => demarrer()}>
            Nouvelle session
          </button>
          <button type="button" className="btn" onClick={onOuvrirLexique}>
            Parcourir le lexique
          </button>
        </div>
      </div>
    )
  }

  const progression = Math.round((index / file.length) * 100)

  return (
    <div className="session">
      <div className="session__barre">
        <div className="session__compteur-capsule" aria-live="polite" aria-atomic="true">
          <span className="session__compteur-icone" aria-hidden="true">📖</span>
          <span className="session__compteur">
            {index + 1} / {file.length}
          </span>
        </div>
        <div
          className="jauge"
          role="progressbar"
          aria-valuenow={progression}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progression de la session"
        >
          <div className="jauge__remplissage" style={{ width: `${progression}%` }} />
        </div>
        <div className={`session__etat session__etat--${carte.etat}`}>
          <span className="session__etat-point" aria-hidden="true" />
          <span className="session__etat-texte">
            {carte.etat === 'nouveau'
              ? 'nouveau mot'
              : carte.etat === 'revision'
                ? 'révision'
                : 'apprentissage'}
          </span>
        </div>
        <button
          type="button"
          className={`session__btn-zen ${zen ? 'session__btn-zen--actif' : ''}`}
          onClick={() => setZen((z) => !z)}
          title={zen ? 'Quitter le mode Zen (Touche Z ou Échap)' : 'Activer le mode Zen immersif (Touche Z)'}
          aria-label={zen ? 'Quitter le mode Zen' : 'Activer le mode Zen plein écran'}
          aria-pressed={zen}
        >
          <span aria-hidden="true">{zen ? '✕' : '🌿'}</span>
          <span className="session__btn-zen-libelle">{zen ? 'Quitter' : 'Mode Zen'}</span>
          <kbd aria-hidden="true">Z</kbd>
        </button>
      </div>

      <div className="carte">
        {carte.etat === 'nouveau' || !exercice ? (
          <FicheMot
            mot={mot}
            carte={carte}
            synthese={synthese}
            onSuspendre={(s) => {
              suspendre(mot.id, s)
              setIndex((i) => i + 1)
            }}
          />
        ) : (
          <>
            <CarteExercice
              exercice={exercice}
              accentsStricts={etat.reglages.accentsStricts}
              reponse={reponse}
              onRepondre={(rep) => {
                setReponse(rep)
                if (rep.reussi) {
                  import('canvas-confetti').then((m) => {
                    const confetti = m.default
                    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#4CAF50', '#8BC34A'] })
                  })
                  import('../lib/sounds').then((m) => m.playSound('success'))
                } else {
                  // Optionnel: son d'erreur léger
                }
              }}
            />
            {reponse && (
              <div className="session__fiche-separateur">
                <FicheMot mot={mot} carte={carte} synthese={synthese} />
              </div>
            )}
          </>
        )}

        {notesDisponibles.length > 0 && (
          <div className="session__evaluation-bloc">
            {!guideVu && (
              <div className="onboarding-conseil" role="note">
                <span className="onboarding-conseil__icone" aria-hidden="true">💡</span>
                <div className="onboarding-conseil__texte">
                  <strong>Principe SM-2 :</strong> Choisissez avec franchise. Si le rappel est hésitant, cliquez sur « À revoir » sans crainte : l'algorithme le replacera au moment optimal pour ancrer sa rétention définitive. Raccourcis : touches <strong>1</strong>–<strong>{notesDisponibles.length}</strong> ou <kbd>Espace</kbd>.
                </div>
                <button
                  type="button"
                  className="onboarding-conseil__fermer"
                  onClick={() => {
                    setGuideVu(true)
                    try { localStorage.setItem('lexique_guide_vu', '1') } catch {}
                  }}
                  aria-label="Masquer ce conseil"
                >
                  ✕
                </button>
              </div>
            )}
            <p className="exercice__etiquette session__evaluation-question">
              {carte.etat === 'nouveau'
                ? 'Vous connaissiez déjà ce mot ?'
                : 'À quel point le rappel a-t-il été facile ?'}
            </p>
            <div className="notes" style={{ '--nb-notes': notesDisponibles.length } as React.CSSProperties}>
              {notesDisponibles.map((note, i) => {
                const estDefaut = (notesDisponibles.includes(2) && note === 2) || (!notesDisponibles.includes(2) && i === 0)
                return (
                  <button
                    key={note}
                    type="button"
                    className={`note-btn ${estDefaut ? 'note-btn--defaut' : ''}`}
                    onClick={() => enregistrer(note)}
                  >
                    <span>{LIBELLE_NOTE[note]}</span>
                    <small>{apercu?.[note]}</small>
                    <div className="note-btn__raccourcis">
                      <kbd aria-hidden="true">{i + 1}</kbd>
                      {estDefaut && <kbd aria-hidden="true" title="Touche Espace pour valider rapidement">␣</kbd>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
