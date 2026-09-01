import { useEffect, useMemo, useState } from 'react'
import Accueil from './components/Accueil'
import Entete from './components/Entete'
import Reviser from './components/Reviser'
import Lexique from './components/Lexique'
import Progression from './components/Progression'
import Reglages from './components/Reglages'
import Legales from './components/Legales'
import Contacts from './components/Contacts'
import { useApp } from './store/AppContext'
import { fileDuJour } from './lib/srs'

export type Onglet = 'accueil' | 'reviser' | 'lexique' | 'progression' | 'reglages' | 'legales' | 'contacts'

const ONGLETS_VALIDES: Onglet[] = ['accueil', 'reviser', 'lexique', 'progression', 'reglages', 'legales', 'contacts']

/** Lit l'onglet dans le fragment d'URL — suffisant tant qu'il n'y a pas de route paramétrée. */
function ongletDepuisUrl(): Onglet {
  const h = window.location.hash.replace('#', '') as Onglet
  return ONGLETS_VALIDES.includes(h) ? h : 'accueil'
}

const MESSAGE_SAUVEGARDE: Record<string, string> = {
  quota:
    "L'espace de stockage du navigateur est plein : vos dernières révisions ne sont plus enregistrées. Exportez votre progression depuis les réglages, puis libérez de l'espace.",
  indisponible:
    "Ce navigateur refuse d'enregistrer des données (navigation privée ?). Votre session fonctionne, mais la progression sera perdue à la fermeture.",
}

export default function App() {
  const { etat, nouveauxRestants, etatSauvegarde } = useApp()
  const [onglet, setOnglet] = useState<Onglet>(ongletDepuisUrl)

  useEffect(() => {
    window.location.hash = onglet
  }, [onglet])

  useEffect(() => {
    const onHash = () => setOnglet(ongletDepuisUrl())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const aReviser = useMemo(
    () =>
      fileDuJour(Object.values(etat.cartes), Date.now(), {
        nouveauxRestants,
        maxParSession: etat.reglages.maxParSession,
      }).length,
    [etat.cartes, nouveauxRestants, etat.reglages.maxParSession],
  )

  return (
    <div className="app">
      <a className="saut-contenu" href="#contenu">
        Aller au contenu
      </a>

      <Entete onChange={setOnglet} aReviser={aReviser} />

      <main className="contenu" id="contenu" tabIndex={-1}>
        {etatSauvegarde !== 'ok' && (
          <p className="avertissement" role="alert" style={{ marginBottom: '1rem' }}>
            <strong>Progression non sauvegardée. </strong>
            {MESSAGE_SAUVEGARDE[etatSauvegarde]}
          </p>
        )}

        {onglet === 'accueil' && <Accueil onCommencer={() => setOnglet('reviser')} onOuvrirLexique={() => setOnglet('lexique')} />}
        {onglet === 'reviser' && <Reviser onOuvrirLexique={() => setOnglet('lexique')} />}
        {onglet === 'lexique' && <Lexique />}
        {onglet === 'progression' && <Progression />}
        {onglet === 'reglages' && <Reglages />}
        {onglet === 'legales' && <Legales />}
        {onglet === 'contacts' && <Contacts />}
      </main>
    </div>
  )
}
