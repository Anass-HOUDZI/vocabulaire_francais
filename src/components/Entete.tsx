import { useState } from 'react'
import type { Onglet } from '../App'
import { useApp } from '../store/AppContext'

interface Props {
  onChange: (o: Onglet) => void
  aReviser: number
}

export default function Entete({ onChange, aReviser }: Props) {
  const { etat, majReglages } = useApp()
  const theme = etat.reglages.theme
  const suivant = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
  const icones = { system: '◐', light: '☀', dark: '☾' } as const
  const libelles = { system: 'Thème système', light: 'Thème clair', dark: 'Thème sombre' } as const

  const [megaMenu, setMegaMenu] = useState<string | null>(null)

  return (
    <header className="entete" style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'var(--fond)' }}>
      <div className="entete__barre" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem', borderBottom: 'none' }}>
        
        <button type="button" onClick={() => onChange('accueil')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <h1 className="marque" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            Lexique<span style={{ color: 'var(--primaire)' }}>.</span>
          </h1>
        </button>

        <nav className="nav" aria-label="Sections" style={{ display: 'flex', gap: '2rem', position: 'relative' }}>
          
          <div 
            onMouseEnter={() => setMegaMenu('produit')} 
            onMouseLeave={() => setMegaMenu(null)}
            style={{ position: 'relative' }}
          >
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: 'var(--texte)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Produit <span style={{ fontSize: '0.8rem' }}>▼</span>
            </button>
            {megaMenu === 'produit' && (
              <div style={{ position: 'absolute', top: '100%', left: '-50%', backgroundColor: 'var(--fond-carte)', padding: '1.5rem', borderRadius: '24px', minWidth: '400px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '2px solid var(--bordure-forte)', borderBottomWidth: '4px' }}>
                <button type="button" className="nav__lien" onClick={() => { onChange('reviser'); setMegaMenu(null) }} style={{ textAlign: 'left', padding: '0.5rem' }}>
                  <strong>💪 Réviser</strong>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--texte-2)' }}>Passez à l'action avec l'algo SRS.</p>
                </button>
                <button type="button" className="nav__lien" onClick={() => { onChange('lexique'); setMegaMenu(null) }} style={{ textAlign: 'left', padding: '0.5rem' }}>
                  <strong>📚 Lexique</strong>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--texte-2)' }}>Parcourez nos 1010 mots premium.</p>
                </button>
                <button type="button" className="nav__lien" onClick={() => { onChange('progression'); setMegaMenu(null) }} style={{ textAlign: 'left', padding: '0.5rem' }}>
                  <strong>🏆 Progression</strong>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--texte-2)' }}>Visualisez vos succès et séries.</p>
                </button>
                <button type="button" className="nav__lien" onClick={() => { onChange('reglages'); setMegaMenu(null) }} style={{ textAlign: 'left', padding: '0.5rem' }}>
                  <strong>⚙️ Réglages</strong>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--texte-2)' }}>Personnalisez l'expérience.</p>
                </button>
              </div>
            )}
          </div>

          <div 
            onMouseEnter={() => setMegaMenu('ressources')} 
            onMouseLeave={() => setMegaMenu(null)}
            style={{ position: 'relative' }}
          >
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: 'var(--texte)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Ressources <span style={{ fontSize: '0.8rem' }}>▼</span>
            </button>
            {megaMenu === 'ressources' && (
              <div style={{ position: 'absolute', top: '100%', left: '-50%', backgroundColor: 'var(--fond-carte)', padding: '1.5rem', borderRadius: '24px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '0.8rem', border: '2px solid var(--bordure-forte)', borderBottomWidth: '4px' }}>
                <button type="button" className="nav__lien" onClick={() => { onChange('legales'); setMegaMenu(null) }} style={{ textAlign: 'left' }}>
                  <strong>⚖️ Mentions Légales</strong>
                </button>
                <button type="button" className="nav__lien" onClick={() => { onChange('contacts'); setMegaMenu(null) }} style={{ textAlign: 'left' }}>
                  <strong>✉️ Contactez-nous</strong>
                </button>
              </div>
            )}
          </div>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className="btn btn--icone btn--discret"
            onClick={() => majReglages({ theme: suivant })}
            title={`${libelles[theme]} — cliquer pour passer à « ${libelles[suivant].toLowerCase()} »`}
          >
            <span aria-hidden="true">{icones[theme]}</span>
          </button>
          
          <button type="button" className="btn btn--principal" onClick={() => onChange('reviser')} style={{ borderRadius: '24px', padding: '0.5rem 1.5rem', fontWeight: 'bold' }}>
            {aReviser > 0 ? `Réviser (${aReviser})` : 'Démarrer'}
          </button>
        </div>
      </div>
    </header>
  )
}
