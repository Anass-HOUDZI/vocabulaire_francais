import { useRef, useState } from 'react'
import { useApp } from '../store/AppContext'
import { useSynthese } from '../hooks/useSynthese'
import { exporterJSON, importerJSON } from '../lib/stockage'
import { LEXIQUE } from '../data/lexique'

export default function Reglages() {
  const { etat, majReglages, remplacer, reinitialiser } = useApp()
  const r = etat.reglages
  const synthese = useSynthese(r.debitVoix)
  const fichier = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'erreur'; texte: string } | null>(null)

  function telecharger() {
    const blob = new Blob([exporterJSON(etat)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const jour = new Date().toISOString().slice(0, 10)
    a.download = `lexique-progression-${jour}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importer(f: File) {
    const texte = await f.text()
    const importe = importerJSON(texte)
    if (!importe) {
      setMessage({ type: 'erreur', texte: "Fichier illisible : l'état actuel n'a pas été modifié." })
      return
    }
    remplacer(importe)
    setMessage({
      type: 'ok',
      texte: `Progression restaurée : ${Object.keys(importe.cartes).length} cartes, ${importe.logs.length} révisions.`,
    })
  }

  return (
    <section aria-labelledby="titre-reglages">
      <h2 id="titre-reglages" className="section-titre">
        Réglages
      </h2>

      <div className="carte" style={{ padding: '0.5rem 1.25rem' }}>
        <div className="reglage">
          <div>
            <label htmlFor="r-theme">Thème</label>
            <p className="reglage__desc">
              « Système » suit le réglage clair/sombre de votre système d'exploitation.
            </p>
          </div>
          <select
            id="r-theme"
            value={r.theme}
            onChange={(e) => majReglages({ theme: e.target.value as typeof r.theme })}
          >
            <option value="system">Système</option>
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </div>

        <div className="reglage">
          <div>
            <label htmlFor="r-echelle">Taille du texte</label>
            <p className="reglage__desc">
              Agrandit toute l'interface : {Math.round(r.echelleTexte * 100)} %.
            </p>
          </div>
          <input
            id="r-echelle"
            type="range"
            min="0.9"
            max="1.3"
            step="0.05"
            value={r.echelleTexte}
            onChange={(e) => majReglages({ echelleTexte: Number(e.target.value) })}
          />
        </div>

        <div className="reglage">
          <div>
            <label htmlFor="r-nouveaux">Mots nouveaux par jour</label>
            <p className="reglage__desc">
              Le levier principal de la charge de travail. Chaque mot introduit revient quatre à cinq
              fois dans le mois qui suit : 20 mots par jour deviennent vite 100 révisions quotidiennes.
            </p>
          </div>
          <input
            id="r-nouveaux"
            type="number"
            min="0"
            max="50"
            value={r.nouveauxParJour}
            onChange={(e) => majReglages({ nouveauxParJour: Number(e.target.value) })}
            style={{ width: '5rem' }}
          />
        </div>

        <div className="reglage">
          <div>
            <label htmlFor="r-session">Cartes maximum par session</label>
            <p className="reglage__desc">
              Plafond de sécurité après une interruption : évite de retrouver 300 cartes en retard.
            </p>
          </div>
          <input
            id="r-session"
            type="number"
            min="5"
            max="200"
            value={r.maxParSession}
            onChange={(e) => majReglages({ maxParSession: Number(e.target.value) })}
            style={{ width: '5rem' }}
          />
        </div>

        <div className="reglage">
          <div>
            <label htmlFor="r-accents">Exiger les accents</label>
            <p className="reglage__desc">
              Désactivé, « proteiforme » est accepté pour « protéiforme », mais l'écart vous est signalé.
            </p>
          </div>
          <input
            id="r-accents"
            type="checkbox"
            checked={r.accentsStricts}
            onChange={(e) => majReglages({ accentsStricts: e.target.checked })}
          />
        </div>

        <div className="reglage">
          <div>
            <label htmlFor="r-audio">Lecture automatique</label>
            <p className="reglage__desc">
              Prononce le mot dès que la réponse est révélée.
              {synthese.voix
                ? ` Voix utilisée : ${synthese.voix}.`
                : " Aucune voix française n'a été détectée sur cet appareil."}
            </p>
          </div>
          <input
            id="r-audio"
            type="checkbox"
            checked={r.audioAuto}
            disabled={!synthese.disponible}
            onChange={(e) => majReglages({ audioAuto: e.target.checked })}
          />
        </div>

        <div className="reglage">
          <div>
            <label htmlFor="r-debit">Débit de la voix</label>
            <p className="reglage__desc">{r.debitVoix.toFixed(2)}× — un débit lent aide sur les mots longs.</p>
          </div>
          <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="r-debit"
              type="range"
              min="0.6"
              max="1.3"
              step="0.05"
              value={r.debitVoix}
              onChange={(e) => majReglages({ debitVoix: Number(e.target.value) })}
            />
            <button
              type="button"
              className="btn"
              disabled={!synthese.disponible}
              onClick={() => synthese.parler('protéiforme')}
            >
              Essayer
            </button>
          </span>
        </div>
      </div>

      <h3 className="section-titre" style={{ marginTop: '1.5rem' }}>
        Données
      </h3>

      <div className="carte" style={{ padding: '1.25rem' }}>
        <p className="reglage__desc" style={{ marginTop: 0 }}>
          Tout est stocké dans ce navigateur, rien n'est envoyé sur un serveur. Vider les données du
          site effacerait votre progression : exportez-la régulièrement. Le lexique ({LEXIQUE.length}{' '}
          mots) est livré avec l'application et n'a pas besoin d'être sauvegardé.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
          <button type="button" className="btn" onClick={telecharger}>
            ⭳ Exporter ma progression
          </button>
          <button type="button" className="btn" onClick={() => fichier.current?.click()}>
            ⭱ Importer un fichier
          </button>
          <input
            ref={fichier}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void importer(f)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            className="btn"
            style={{ marginLeft: 'auto', color: 'var(--erreur)', borderColor: 'var(--erreur)' }}
            onClick={() => {
              if (
                window.confirm(
                  'Effacer toute la progression ? Les cartes repartent de zéro et l’historique est supprimé. Cette action est irréversible.',
                )
              ) {
                reinitialiser()
                setMessage({ type: 'ok', texte: 'Progression réinitialisée.' })
              }
            }}
          >
            Réinitialiser la progression
          </button>
        </div>

        {message && (
          <p
            className={message.type === 'ok' ? 'verdict verdict--juste' : 'verdict verdict--faux'}
            role="status"
            style={{ marginTop: '1rem' }}
          >
            <span aria-hidden="true">{message.type === 'ok' ? '✓' : '✕'}</span>
            <span>{message.texte}</span>
          </p>
        )}
      </div>
    </section>
  )
}
