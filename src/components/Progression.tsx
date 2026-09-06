import { useMemo } from 'react'
import { useApp } from '../store/AppContext'
import { calculerStatistiques, jourLogique, JOUR_MS } from '../lib/srs'
import { PAR_ID } from '../data/lexique'

const JOURS_COURTS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']

export default function Progression() {
  const { etat, acheterGel } = useApp()

  const stats = useMemo(
    () => calculerStatistiques(Object.values(etat.cartes), etat.logs, Date.now()),
    [etat.cartes, etat.logs],
  )

  const maxCharge = Math.max(1, ...stats.chargePrevue)
  const actives = stats.total - stats.suspendues

  /** Les cinq mots les plus souvent oubliés : ce sont eux qu'il faut retravailler. */
  const recalcitrants = useMemo(() => {
    return Object.values(etat.cartes)
      .filter((c) => c.echecs > 0)
      .sort((a, b) => b.echecs - a.echecs || b.rechutes - a.rechutes)
      .slice(0, 5)
      .map((c) => ({ carte: c, mot: PAR_ID.get(c.motId) }))
      .filter((x) => x.mot)
  }, [etat.cartes])

  const parts = [
    { cle: 'nouveaux', valeur: stats.nouveaux, couleur: 'var(--bordure-forte)', libelle: 'Jamais vus' },
    { cle: 'apprentissage', valeur: stats.enApprentissage, couleur: 'var(--alerte)', libelle: 'En apprentissage' },
    { cle: 'jeunes', valeur: stats.jeunes, couleur: 'var(--info)', libelle: 'En consolidation' },
    { cle: 'matures', valeur: stats.matures, couleur: 'var(--succes)', libelle: 'Acquis (> 21 j)' },
  ]

  return (
    <section aria-labelledby="titre-progression">
      <h1 id="titre-progression" className="section-titre">
        Progression
      </h1>

      {etat.progression && (
        <div className="carte progression__resume-carte">
          <div className="progression__resume-entete">
            <div>
              <h3 className="progression__niveau-titre">Niveau {etat.progression.niveau}</h3>
              <p className="progression__xp-texte">{etat.progression.xp} XP au total</p>
            </div>
            <div className="progression__monnaie-bloc">
              <span className="progression__monnaie-valeur">🪙 {etat.progression.monnaie}</span>
              <p className="progression__gels-texte">Gels disponibles : {etat.progression.gelDeSerie}</p>
            </div>
          </div>
          <div className="jauge progression__jauge">
            <div className="jauge__remplissage" style={{ width: `${(etat.progression.xp % 100)}%`, background: 'var(--accent)' }} />
          </div>
          <div className="progression__actions">
            <button 
              className="btn btn--principal progression__btn-achat" 
              onClick={acheterGel} 
              disabled={etat.progression.monnaie < 100}
            >
              Acheter un gel de série (100 🪙)
            </button>
          </div>
          {etat.progression.badges.length > 0 && (
            <div className="progression__badges-bloc">
              <strong className="progression__badges-titre">Badges obtenus :</strong>
              <div className="progression__badges-liste">
                {etat.progression.badges.map(b => (
                  <span key={b} className="progression__badge-pastille">
                    {b === 'parfait' ? '🌟 Parfait' : b === 'oiseau-de-nuit' ? '🦉 Oiseau de nuit' : b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grille-stats">
        <div className="stat">
          <div className="stat__valeur">{stats.matures}</div>
          <div className="stat__libelle">Mots acquis</div>
        </div>
        <div className="stat">
          <div className="stat__valeur">
            {stats.retention30j === null ? '—' : `${Math.round(stats.retention30j * 100)} %`}
          </div>
          <div className="stat__libelle">Rappel sur 30 j</div>
        </div>
        <div className="stat">
          <div className="stat__valeur">{stats.revisionsAujourdhui}</div>
          <div className="stat__libelle">Révisions aujourd'hui</div>
        </div>
        <div className="stat">
          <div className="stat__valeur">{stats.serie}</div>
          <div className="stat__libelle">Jours consécutifs</div>
        </div>
      </div>

      {stats.retention30j === null && (
        <p className="avertissement">
          Le taux de rappel se calcule sur les révisions de mots déjà appris. Il apparaîtra après
          quelques jours d'utilisation — un chiffre calculé sur trois révisions ne voudrait rien dire.
        </p>
      )}

      <div className="carte progression__carte-section">
        <h3 className="bloc__titre">Répartition des {actives} mots suivis</h3>
        <div className="repartition" role="img" aria-label={parts.map((p) => `${p.libelle} : ${p.valeur}`).join(', ')}>
          {parts.map((p) => (
            <span
              key={p.cle}
              style={{ background: p.couleur, width: `${actives ? (p.valeur / actives) * 100 : 0}%` }}
            />
          ))}
        </div>
        <p className="legende">
          {parts.map((p) => (
            <span key={p.cle}>
              <i style={{ background: p.couleur }} aria-hidden="true" />
              {p.libelle} : <strong>{p.valeur}</strong>
            </span>
          ))}
        </p>
      </div>

      <div className="carte progression__carte-section">
        <h3 className="bloc__titre">Charge de révision prévue</h3>
        <div className="histogramme">
          {stats.chargePrevue.map((n, i) => {
            const jour = new Date(Date.now() + i * JOUR_MS)
            return (
              <div className="histogramme__barre" key={i}>
                <span className="histogramme__nombre">{n}</span>
                <div
                  className="histogramme__valeur"
                  style={{ height: `${(n / maxCharge) * 100}%` }}
                  role="img"
                  aria-label={`${n} carte${n > 1 ? 's' : ''} le ${jour.toLocaleDateString('fr-FR')}`}
                />
                <span className="histogramme__jour">
                  {i === 0 ? "auj." : JOURS_COURTS[jour.getDay()]}
                </span>
              </div>
            )
          })}
        </div>
        <p className="reglage__desc progression__desc-court">
          Une charge qui s'envole signale un rythme de mots nouveaux trop élevé : chaque mot introduit
          aujourd'hui revient quatre à cinq fois dans le mois.
        </p>
      </div>

      {recalcitrants.length > 0 && (
        <div className="carte progression__carte-section">
          <h3 className="bloc__titre">Mots les plus résistants</h3>
          <ul className="progression__recalcitrants-liste">
            {recalcitrants.map(({ carte, mot }) => (
              <li key={carte.motId} className="progression__recalcitrant-item">
                <strong lang="fr" className="progression__recalcitrant-mot">
                  {mot?.mot}
                </strong>{' '}
                <span className="progression__recalcitrant-stats">
                  — {carte.echecs} oubli{carte.echecs > 1 ? 's' : ''}
                  {carte.rechutes > 0 && `, ${carte.rechutes} rechute${carte.rechutes > 1 ? 's' : ''}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="reglage__desc progression__note-bas">
        Journée en cours : {jourLogique(Date.now())} (la journée bascule à 4 h du matin).
      </p>
    </section>
  )
}
