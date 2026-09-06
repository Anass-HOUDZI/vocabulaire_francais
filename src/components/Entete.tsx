import type { Onglet } from '../App'
import { useApp } from '../store/AppContext'
import LogoMarque from './LogoMarque'

interface Props {
  onglet?: Onglet
  onChange: (o: Onglet) => void
  aReviser: number
}

export default function Entete({ onglet = 'accueil', onChange, aReviser }: Props) {
  const { etat, majReglages } = useApp()
  const theme = etat.reglages.theme
  const suivant = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
  const icones = { system: '◐', light: '☀', dark: '☾' } as const
  const libelles = { system: 'Thème système', light: 'Thème clair', dark: 'Thème sombre' } as const

  return (
    <header className="entete">
      <div className="entete__barre">
        <button
          type="button"
          onClick={() => onChange('accueil')}
          className="entete__marque-btn"
          aria-label="Accueil Lexique"
        >
          <LogoMarque taille={34} className="marque__logo" />
          <span className="marque">
            Lexique<span>.</span>
          </span>
          <span className="marque__devise" aria-hidden="true">
            · L'art du mot juste
          </span>
        </button>

        <nav className="nav" aria-label="Sections">
          <button
            type="button"
            className="nav__lien"
            onClick={() => onChange('accueil')}
            aria-current={onglet === 'accueil' ? 'page' : undefined}
          >
            Accueil
          </button>

          <button
            type="button"
            className="nav__lien"
            onClick={() => onChange('reviser')}
            aria-current={onglet === 'reviser' ? 'page' : undefined}
          >
            Réviser
            {aReviser > 0 && (
              <span className="pastille" aria-label={`${aReviser} carte${aReviser > 1 ? 's' : ''} à réviser`}>
                {aReviser}
              </span>
            )}
          </button>

          <button
            type="button"
            className="nav__lien"
            onClick={() => onChange('lexique')}
            aria-current={onglet === 'lexique' ? 'page' : undefined}
          >
            Lexique
          </button>

          <button
            type="button"
            className="nav__lien"
            onClick={() => onChange('progression')}
            aria-current={onglet === 'progression' ? 'page' : undefined}
          >
            Progression
          </button>

          <button
            type="button"
            className="nav__lien"
            onClick={() => onChange('reglages')}
            aria-current={onglet === 'reglages' ? 'page' : undefined}
          >
            Réglages
          </button>
        </nav>

        <div className="entete__actions">
          <button
            type="button"
            className="entete__theme-btn"
            onClick={() => majReglages({ theme: suivant })}
            title={`${libelles[theme]} — cliquer pour passer à « ${libelles[suivant].toLowerCase()} »`}
            aria-label={`${libelles[theme]} — cliquer pour basculer vers ${libelles[suivant].toLowerCase()}`}
          >
            <span aria-hidden="true">{icones[theme]}</span>
          </button>

          {onglet !== 'reviser' && (
            <>
              <div className="entete__separateur" aria-hidden="true" />
              <button
                type="button"
                className="btn btn--principal entete__cta"
                onClick={() => onChange('reviser')}
              >
                {aReviser > 0 ? `Réviser (${aReviser})` : 'Pratiquer'}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
