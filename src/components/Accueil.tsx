import { LEXIQUE } from '../data/lexique'

/**
 * Écran de première ouverture.
 *
 * À J0, la file du jour est bien remplie mais l'utilisateur ne sait pas ce qui
 * l'attend : sans un mot d'explication, la première carte arrive sans contexte et
 * les quatre boutons de notation paraissent arbitraires. Trois phrases suffisent,
 * et surtout un premier lot volontairement court — cinq mots, pas huit : la
 * première session doit se terminer, pas s'endurer.
 *
 * Cet écran ne s'affiche qu'une fois : dès qu'une révision est journalisée, la
 * session normale prend le relais.
 */

const NB_DECOUVERTE = 5

interface Props {
  onCommencer: (limiteNouveaux: number) => void
  onOuvrirLexique: () => void
}

export default function Accueil({ onCommencer, onOuvrirLexique }: Props) {
  return (
    <div className="session">
      <div className="carte" style={{ padding: '2rem 1.75rem' }}>
        <p className="exercice__etiquette">Première ouverture</p>
        <h2
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            margin: '0.3rem 0 1rem',
            fontWeight: 600,
            letterSpacing: '-0.015em',
          }}
        >
          {LEXIQUE.length} mots du français soutenu, un peu chaque jour
        </h2>

        <ol style={{ paddingLeft: '1.2rem', margin: '0 0 1.5rem', color: 'var(--texte-2)' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            Chaque mot arrive d'abord sous forme de <strong>fiche complète</strong> : définition,
            prononciation, exemple en contexte, et le mésusage à éviter.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Il revient ensuite sous forme d'<strong>exercice</strong> — compléter une phrase,
            retrouver le mot depuis sa définition, distinguer l'emploi juste du fautif.
          </li>
          <li>
            Vous indiquez si le rappel a été facile ou non ; l'espacement s'ajuste tout seul.
            <strong> Dix minutes par jour valent mieux qu'une heure le dimanche.</strong>
          </li>
        </ol>

        <p className="avertissement" style={{ marginBottom: '1.5rem' }}>
          Tout reste dans ce navigateur : aucun compte, aucune donnée envoyée. Pensez à exporter
          votre progression de temps en temps depuis les réglages.
        </p>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--principal"
            onClick={() => onCommencer(NB_DECOUVERTE)}
            autoFocus
          >
            Découvrir {NB_DECOUVERTE} mots
          </button>
          <button type="button" className="btn" onClick={onOuvrirLexique}>
            Parcourir le lexique d'abord
          </button>
        </div>
      </div>
    </div>
  )
}
