import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LEXIQUE, PAR_ID } from '../data/lexique'
import { useApp } from '../store/AppContext'
import { useSynthese } from '../hooks/useSynthese'
import { apercuIntervalles, fileDuJour } from '../lib/srs'
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

export default function Reviser({ onOuvrirLexique }: { onOuvrirLexique: () => void }) {
  const { etat, noter, suspendre, nouveauxRestants } = useApp()
  const synthese = useSynthese(etat.reglages.debitVoix)

  const [file, setFile] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [reponse, setReponse] = useState<Reponse | null>(null)
  const [bilan, setBilan] = useState({ vus: 0, justes: 0 })
  const repassages = useRef<Record<string, number>>({})

  const demarrer = useCallback(() => {
    const cartes = Object.values(etat.cartes)
    const selection = fileDuJour(cartes, Date.now(), {
      nouveauxRestants,
      maxParSession: etat.reglages.maxParSession,
    })
    repassages.current = {}
    setFile(selection.map((c) => c.motId))
    setIndex(0)
    setReponse(null)
    setBilan({ vus: 0, justes: 0 })
    // `etat.cartes` est volontairement absent des dépendances : la file est
    // figée au démarrage de la session, sinon chaque notation la recalculerait
    // et ferait sauter la carte courante.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.reglages.maxParSession, nouveauxRestants])

  useEffect(() => {
    demarrer()
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

      setReponse(null)
      setIndex((i) => i + 1)
    },
    [motId, carte, noter, exercice, reponse],
  )

  // Raccourcis 1–4 pour la notation, actifs uniquement quand les boutons le sont.
  useEffect(() => {
    if (!notesDisponibles.length) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
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

  // Lecture automatique du mot à la correction, si l'utilisateur l'a demandé.
  useEffect(() => {
    if (etat.reglages.audioAuto && reponse && mot) synthese.parler(mot.mot)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reponse, mot?.id])

  /* ----------------------------------------------------------- Rendus */

  if (!file.length) {
    return (
      <div className="carte vide">
        <p className="vide__icone" aria-hidden="true">
          ✻
        </p>
        <h2>Rien à réviser pour le moment</h2>
        <p>
          Votre file du jour est vide. C'est le fonctionnement normal de la répétition espacée :
          revenez demain, ou augmentez le nombre de mots nouveaux par jour dans les réglages.
        </p>
        <p style={{ marginTop: '1.2rem' }}>
          <button type="button" className="btn" onClick={onOuvrirLexique}>
            Parcourir le lexique
          </button>
        </p>
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
        <p style={{ marginTop: '1.2rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button type="button" className="btn btn--principal" onClick={demarrer}>
            Nouvelle session
          </button>
          <button type="button" className="btn" onClick={onOuvrirLexique}>
            Parcourir le lexique
          </button>
        </p>
      </div>
    )
  }

  const progression = Math.round((index / file.length) * 100)

  return (
    <div className="session">
      <div className="session__barre">
        <span>
          {index + 1} / {file.length}
        </span>
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
        <span>
          {carte.etat === 'nouveau'
            ? 'nouveau mot'
            : carte.etat === 'revision'
              ? 'révision'
              : 'apprentissage'}
        </span>
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
              onRepondre={setReponse}
            />
            {reponse && (
              <div style={{ borderTop: '1px solid var(--bordure)' }}>
                <FicheMot mot={mot} carte={carte} synthese={synthese} />
              </div>
            )}
          </>
        )}

        {notesDisponibles.length > 0 && (
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <p className="exercice__etiquette" style={{ marginBottom: '0.4rem' }}>
              {carte.etat === 'nouveau'
                ? 'Vous connaissiez déjà ce mot ?'
                : 'À quel point le rappel a-t-il été facile ?'}
            </p>
            <div className="notes" style={{ gridTemplateColumns: `repeat(${notesDisponibles.length}, 1fr)` }}>
              {notesDisponibles.map((note, i) => (
                <button
                  key={note}
                  type="button"
                  className="note-btn"
                  onClick={() => enregistrer(note)}
                >
                  <span>{LIBELLE_NOTE[note]}</span>
                  <small>{apercu?.[note]}</small>
                  <kbd aria-hidden="true">{i + 1}</kbd>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
