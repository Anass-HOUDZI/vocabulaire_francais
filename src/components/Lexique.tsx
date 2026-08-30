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

  useEffect(() => {
    const d = dialogue.current
    if (!d) return
    if (ouvert && !d.open) d.showModal()
    if (!ouvert && d.open) d.close()
  }, [ouvert])

  const resultats = useMemo(() => {
    const q = canoniser(recherche)
    const filtres = LEXIQUE.filter((m) => {
      const carte = etat.cartes[m.id]
      if (syllabes !== 'toutes' && m.nbSyllabes !== syllabes) return false
      if (difficulte !== 'toutes' && m.difficulte !== difficulte) return false
      if (theme !== 'tous' && m.theme !== theme) return false
      if (categorie !== 'toutes' && m.categorie !== categorie) return false
      if (q && !canoniser(`${m.mot} ${m.definition} ${m.synonymes.join(' ')}`).includes(q)) return false

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

  const reinitialiserFiltres = () => {
    setRecherche('')
    setSyllabes('toutes')
    setDifficulte('toutes')
    setTheme('tous')
    setCategorie('toutes')
    setFiltreEtat('tous')
  }

  return (
    <section aria-labelledby="titre-lexique">
      <h2 id="titre-lexique" className="section-titre">
        Lexique — {resultats.length} mot{resultats.length > 1 ? 's' : ''}
        {resultats.length !== LEXIQUE.length && (
          <span style={{ color: 'var(--texte-3)', fontWeight: 400 }}> sur {LEXIQUE.length}</span>
        )}
      </h2>

      <div className="filtres">
        <div className="champ">
          <label htmlFor="f-recherche">Rechercher</label>
          <input
            id="f-recherche"
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="mot, définition, synonyme…"
            lang="fr"
          />
        </div>

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
            <option value="alpha">Alphabétique</option>
            <option value="difficulte">Difficulté décroissante</option>
            <option value="syllabes">Nombre de syllabes</option>
            <option value="echeance">Prochaine échéance</option>
          </select>
        </div>

        <div className="champ" style={{ flexBasis: '100%' }}>
          <label id="lbl-etat">Avancement</label>
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
                aria-pressed={filtreEtat === cle}
                onClick={() => setFiltreEtat(cle)}
              >
                {lib}
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
          <p style={{ marginTop: '1rem' }}>
            <button type="button" className="btn" onClick={reinitialiserFiltres}>
              Réinitialiser les filtres
            </button>
          </p>
        </div>
      ) : (
        <ul className="liste">
          {resultats.map((m) => {
            const carte = etat.cartes[m.id]
            return (
              <li key={m.id}>
                <button type="button" className="ligne-mot" onClick={() => setOuvert(m)}>
                  <span
                    className={`puce-etat ${classeEtat(carte)}`}
                    aria-hidden="true"
                    title={libelleEtat(carte)}
                  />
                  <span>
                    <span className="ligne-mot__mot" lang="fr">
                      {m.mot}
                    </span>{' '}
                    <span className="ligne-mot__api">{m.api}</span>
                    <span className="visuellement-cache"> — {libelleEtat(carte)} — </span>
                    <br />
                    <span className="ligne-mot__def">{m.definition}</span>
                  </span>
                  <span className="etiquettes" style={{ margin: 0, justifyContent: 'flex-end' }}>
                    <span className="etiquette">{m.nbSyllabes} syll.</span>
                    <span className={`etiquette etiquette--diff-${m.difficulte}`}>{m.difficulte}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <dialog
        className="modale"
        ref={dialogue}
        onClose={() => setOuvert(null)}
        aria-label={ouvert ? `Fiche du mot ${ouvert.mot}` : 'Fiche'}
      >
        {ouvert && (
          <>
            <FicheMot
              mot={ouvert}
              carte={etat.cartes[ouvert.id]}
              synthese={synthese}
              onSuspendre={(s) => suspendre(ouvert.id, s)}
            />
            <div style={{ padding: '0 1.5rem 1.5rem' }}>
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
