import type { Onglet } from '../App'
import { useApp } from '../store/AppContext'

const ONGLETS: { cle: Onglet; libelle: string; icone: string }[] = [
  { cle: 'reviser', libelle: 'Réviser', icone: '◆' },
  { cle: 'lexique', libelle: 'Lexique', icone: '☰' },
  { cle: 'progression', libelle: 'Progression', icone: '▤' },
  { cle: 'reglages', libelle: 'Réglages', icone: '⚙' },
]

interface Props {
  onglet: Onglet
  onChange: (o: Onglet) => void
  aReviser: number
}

export default function Entete({ onglet, onChange, aReviser }: Props) {
  const { etat, majReglages } = useApp()
  const theme = etat.reglages.theme
  const suivant = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
  const icones = { system: '◐', light: '☀', dark: '☾' } as const
  const libelles = { system: 'Thème système', light: 'Thème clair', dark: 'Thème sombre' } as const

  return (
    <header className="entete">
      <div className="entete__barre">
        <h1 className="marque">
          Lexique<span>.</span>
        </h1>

        <nav className="nav" aria-label="Sections">
          {ONGLETS.map((o) => (
            <button
              key={o.cle}
              type="button"
              className="nav__lien"
              aria-current={onglet === o.cle ? 'page' : undefined}
              onClick={() => onChange(o.cle)}
            >
              <span aria-hidden="true">{o.icone}</span>
              {o.libelle}
              {o.cle === 'reviser' && aReviser > 0 && (
                <span className="pastille">{aReviser}</span>
              )}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="btn btn--icone btn--discret"
          onClick={() => majReglages({ theme: suivant })}
          title={`${libelles[theme]} — cliquer pour passer à « ${libelles[suivant].toLowerCase()} »`}
        >
          <span aria-hidden="true">{icones[theme]}</span>
          <span className="visuellement-cache">
            {libelles[theme]}. Activer : {libelles[suivant].toLowerCase()}
          </span>
        </button>
      </div>
    </header>
  )
}
