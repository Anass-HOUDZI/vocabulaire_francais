import { useEffect, useMemo, useRef, useState } from 'react'
import { LEXIQUE, THEMES, CATEGORIES, SYLLABES_DISPONIBLES } from '../data/lexique'
import { useApp } from '../store/AppContext'
import { useSynthese } from '../hooks/useSynthese'
import { SEUIL_MATURITE } from '../lib/srs'
import { canoniser } from '../lib/texte'
import type { Carte, Mot } from '../types'
import FicheMot from './FicheMot'

type Tri = 'alpha' | 'difficulte' | 'syllabes' | 'echeance'
type FiltreEtat = 'tous' | 'nouveaux' | 'en-cours' | 'connus' | 'mis-de-cote'

function classeEtat(carte: Carte | undefined): string {
  if (!carte) return ''
  if (carte.suspendue) return 'puce-etat--suspendue'
  if (carte.etat === 'nouveau') return ''
  if (carte.etat === 'revision') {
    return carte.intervalle >= SEUIL_MATURITE ? 'puce-etat--mature' : 'puce-etat--revision'
  }
  return 'puce-etat--apprentissage'
}

function libelleEtat(carte: Carte | undefined): string {
  if (!carte) return 'inconnu'
  if (carte.suspendue) return 'mis de côté'
  if (carte.etat === 'nouveau') return 'jamais vu'
  if (carte.etat === 'revision') {
    return carte.intervalle >= SEUIL_MATURITE ? 'acquis' : 'en révision'
  }
  return 'en apprentissage'
}

/** Pré-indexation canonique de recherche : calculée une seule fois au chargement du module. */
const TEXTE_RECHERCHE: ReadonlyMap<string, string> = new Map(
  LEXIQUE.map((m) => [m.id, canoniser(`${m.mot} ${m.definition} ${m.synonymes.join(' ')}`)]),
)

export default function Lexique() {
  const { etat, suspendre } = useApp()
  const synthese = useSynthese(etat.reglages.debitVoix)

  const [recherche, setRecherche] = useState('')
  const [syllabes, setSyllabes] = useState<number | 'toutes'>('toutes')
  const [difficulte, setDifficulte] = useState<number | 'toutes'>('toutes')
  const [theme, setTheme] = useState<string>('tous')
  const [categorie, setCategorie] = useState<string>('toutes')
  const [filtreEtat, setFiltreEtat] = useState<FiltreEtat>('tous')
  const [tri, setTri] = useState<Tri>('alpha')
  const [ouvert, setOuvert] = useState<Mot | null>(null)

  const dialogue = useRef<HTMLDialogElement>(null)
  const sentinelleRef = useRef<HTMLDivElement>(null)
  const [nbAffiches, setNbAffiches] = useState(60)

  useEffect(() => {
    const d = dialogue.current
    if (!d) return
    if (ouvert && !d.open) {
      if (typeof d.showModal === 'function') {
        d.showModal()
      } else {
        d.setAttribute('open', '')
      }
    }
    if (!ouvert && d.open) {
      if (typeof d.close === 'function') {
        d.close()
      } else {
        d.removeAttribute('open')
      }
    }
  }, [ouvert])

  const resultats = useMemo(() => {
    const q = canoniser(recherche)
    const filtres = LEXIQUE.filter((m) => {
      const carte = etat.cartes[m.id]
      if (syllabes !== 'toutes' && m.nbSyllabes !== syllabes) return false
      if (difficulte !== 'toutes' && m.difficulte !== difficulte) return false
      if (theme !== 'tous' && m.theme !== theme) return false
      if (categorie !== 'toutes' && m.categorie !== categorie) return false
      if (q && !TEXTE_RECHERCHE.get(m.id)?.includes(q)) return false

      switch (filtreEtat) {
        case 'nouveaux':
          return !carte || (carte.etat === 'nouveau' && !carte.suspendue)
        case 'en-cours':
          return !!carte && !carte.suspendue && (carte.etat === 'apprentissage' || carte.etat === 'rechute' || (carte.etat === 'revision' && carte.intervalle < SEUIL_MATURITE))
        case 'connus':
          return !!carte && !carte.suspendue && carte.etat === 'revision' && carte.intervalle >= SEUIL_MATURITE
        case 'mis-de-cote':
          return !!carte?.suspendue
        default:
          return true
      }
    })

    const comparer: Record<Tri, (a: Mot, b: Mot) => number> = {
      alpha: (a, b) => a.mot.localeCompare(b.mot, 'fr'),
      difficulte: (a, b) => b.difficulte - a.difficulte || a.mot.localeCompare(b.mot, 'fr'),
      syllabes: (a, b) => a.nbSyllabes - b.nbSyllabes || a.mot.localeCompare(b.mot, 'fr'),
      echeance: (a, b) => (etat.cartes[a.id]?.du ?? 0) - (etat.cartes[b.id]?.du ?? 0),
    }
    return filtres.sort(comparer[tri])
  }, [recherche, syllabes, difficulte, theme, categorie, filtreEtat, tri, etat.cartes])

  useEffect(() => {
    setNbAffiches(60)
  }, [recherche, syllabes, difficulte, theme, categorie, filtreEtat, tri])

  useEffect(() => {
    const el = sentinelleRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setNbAffiches((prev) => Math.min(prev + 60, resultats.length))
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [resultats.length])

  const motsAffiches = useMemo(() => resultats.slice(0, nbAffiches), [resultats, nbAffiches])

  const filtresActifs = Boolean(
    recherche ||
    syllabes !== 'toutes' ||
    difficulte !== 'toutes' ||
    theme !== 'tous' ||
    categorie !== 'toutes' ||
    filtreEtat !== 'tous' ||
    tri !== 'alpha'
  )

  const statsEtats = useMemo(() => {
    let nouveaux = 0
    let enCours = 0
    let connus = 0
    let misDeCote = 0
    for (const m of LEXIQUE) {
      const c = etat.cartes[m.id]
      if (c?.suspendue) {
        misDeCote++
      } else if (!c || c.etat === 'nouveau') {
        nouveaux++
      } else if (
        c.etat === 'apprentissage' ||
        c.etat === 'rechute' ||
        (c.etat === 'revision' && c.intervalle < SEUIL_MATURITE)
      ) {
        enCours++
      } else if (c.etat === 'revision' && c.intervalle >= SEUIL_MATURITE) {
        connus++
      }
    }
    return {
      tous: LEXIQUE.length,
      nouveaux,
      'en-cours': enCours,
      connus,
      'mis-de-cote': misDeCote,
    }
  }, [etat.cartes])

  const reinitialiserFiltres = () => {
    setRecherche('')
    setSyllabes('toutes')
    setDifficulte('toutes')
    setTheme('tous')
    setCategorie('toutes')
    setFiltreEtat('tous')
    setTri('alpha')
  }

  return (
    <section aria-labelledby="titre-lexique" className="lexique-section">
      <div className="lexique__entete">
        <h1 id="titre-lexique" className="section-titre">
          Lexique <span className="section-titre__compte">— {resultats.length} mot{resultats.length > 1 ? 's' : ''}</span>
          {resultats.length !== LEXIQUE.length && (
            <span className="section-titre__total"> sur {LEXIQUE.length}</span>
          )}
        </h1>
        {filtresActifs && (
          <button
            type="button"
            className="filtres__reinit-btn"
            onClick={reinitialiserFiltres}
            aria-label="Réinitialiser tous les filtres"
          >
            <span aria-hidden="true">↺</span> Effacer les filtres
          </button>
        )}
      </div>

      <div className="filtres" role="search" aria-label="Filtres et recherche dans le lexique">
        <div className="filtres__ligne-recherche">
          <div className="champ champ--recherche">
            <label htmlFor="f-recherche">Recherche rapide</label>
            <div className="champ__recherche-boite">
              <span className="champ__recherche-icone" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                id="f-recherche"
                type="search"
                maxLength={100}
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher un mot, une racine, une définition…"
                lang="fr"
              />
              {recherche && (
                <button
                  type="button"
                  className="champ__effacer-btn"
                  onClick={() => setRecherche('')}
                  aria-label="Effacer la recherche"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="filtres__grille">
          <div className="champ">
            <label htmlFor="f-syllabes">Syllabes</label>
            <select
              id="f-syllabes"
              value={String(syllabes)}
              onChange={(e) => setSyllabes(e.target.value === 'toutes' ? 'toutes' : Number(e.target.value))}
            >
              <option value="toutes">Toutes</option>
              {SYLLABES_DISPONIBLES.map((n) => (
                <option key={n} value={n}>
                  {n} syllabes
                </option>
              ))}
            </select>
          </div>

          <div className="champ">
            <label htmlFor="f-difficulte">Difficulté</label>
            <select
              id="f-difficulte"
              value={String(difficulte)}
              onChange={(e) => setDifficulte(e.target.value === 'toutes' ? 'toutes' : Number(e.target.value))}
            >
              <option value="toutes">Toutes</option>
              <option value="1">1 — accessible</option>
              <option value="2">2 — soutenu</option>
              <option value="3">3 — exigeant</option>
              <option value="4">4 — rare</option>
              <option value="5">5 — érudit</option>
            </select>
          </div>

          <div className="champ">
            <label htmlFor="f-theme">Champ</label>
            <select id="f-theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="tous">Tous</option>
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="champ">
            <label htmlFor="f-categorie">Nature</label>
            <select id="f-categorie" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
              <option value="toutes">Toutes</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="champ">
            <label htmlFor="f-tri">Tri</label>
            <select id="f-tri" value={tri} onChange={(e) => setTri(e.target.value as Tri)}>
              <option value="alpha">Alphabétique (A → Z)</option>
              <option value="difficulte">Difficulté décroissante</option>
              <option value="syllabes">Nombre de syllabes</option>
              <option value="echeance">Prochaine échéance</option>
            </select>
          </div>
        </div>

        <div className="filtres__avancement">
          <label id="lbl-etat" className="filtres__avancement-label">Avancement :</label>
          <div className="segmente" role="group" aria-labelledby="lbl-etat">
            {(
              [
                ['tous', 'Tous'],
                ['nouveaux', 'Jamais vus'],
                ['en-cours', 'En cours'],
                ['connus', 'Acquis'],
                ['mis-de-cote', 'Mis de côté'],
              ] as [FiltreEtat, string][]
            ).map(([cle, lib]) => (
              <button
                key={cle}
                type="button"
                className={`segmente__btn ${filtreEtat === cle ? 'segmente__btn--actif' : ''}`}
                aria-pressed={filtreEtat === cle}
                onClick={() => setFiltreEtat(cle)}
              >
                <span className="segmente__texte">{lib}</span>
                <span className="segmente__compte">
                  {statsEtats[cle]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {resultats.length === 0 ? (
        <div className="carte vide">
          <p className="vide__icone" aria-hidden="true">
            ⌕
          </p>
          <h2>Aucun mot ne correspond</h2>
          <p>Les filtres actifs sont trop restrictifs.</p>
          <div className="vide__actions">
            <button type="button" className="btn" onClick={reinitialiserFiltres}>
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      ) : (
        <>
          <ul className="liste" aria-label="Mots du lexique">
            {motsAffiches.map((m) => {
              const carte = etat.cartes[m.id]
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    className="ligne-mot"
                    onClick={() => setOuvert(m)}
                    aria-haspopup="dialog"
                  >
                    <span
                      className={`puce-etat ${classeEtat(carte)}`}
                      aria-hidden="true"
                      title={libelleEtat(carte)}
                    />
                    <span className="ligne-mot__contenu">
                      <span className="ligne-mot__entete">
                        <span className="ligne-mot__mot" lang="fr">
                          {m.mot}
                        </span>
                        <span className="ligne-mot__nature">{m.categorie}</span>
                        <span className="ligne-mot__api">{m.api}</span>
                        <span className="visuellement-cache"> — {libelleEtat(carte)} — </span>
                      </span>
                      <span className="ligne-mot__def">{m.definition}</span>
                    </span>
                    <span className="ligne-mot__droite">
                      <span className="etiquettes ligne-mot__etiquettes">
                        <span className="etiquette etiquette--syllabes">{m.nbSyllabes} syll.</span>
                        <span className={`etiquette etiquette--diff-${m.difficulte}`}>
                          diff. {m.difficulte}
                        </span>
                      </span>
                      <span className="ligne-mot__fleche" aria-hidden="true">
                        →
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {nbAffiches < resultats.length && (
            <div className="lexique__pagination">
              <div ref={sentinelleRef} aria-hidden="true" className="lexique__sentinelle" />
              <button
                type="button"
                className="btn btn--discret"
                onClick={() => setNbAffiches((prev) => Math.min(prev + 60, resultats.length))}
              >
                Afficher plus de mots ({resultats.length - nbAffiches} restants)
              </button>
            </div>
          )}
        </>
      )}

      <dialog
        className="modale"
        ref={dialogue}
        onClose={() => setOuvert(null)}
        aria-label={ouvert ? `Fiche du mot ${ouvert.mot}` : 'Fiche'}
      >
        {ouvert && (
          <>
            <button
              type="button"
              className="modale__fermer-btn"
              onClick={() => setOuvert(null)}
              aria-label="Fermer la fiche"
            >
              ✕
            </button>
            <FicheMot
              mot={ouvert}
              carte={etat.cartes[ouvert.id]}
              synthese={synthese}
              onSuspendre={(s) => suspendre(ouvert.id, s)}
            />
            <div className="modale__pied">
              <button type="button" className="btn" onClick={() => setOuvert(null)}>
                Fermer
              </button>
            </div>
          </>
        )}
      </dialog>
    </section>
  )
}
