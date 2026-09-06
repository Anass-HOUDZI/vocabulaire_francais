import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * Barrière d'erreur racine.
 *
 * Sans elle, une exception dans un composant vide l'écran : l'utilisateur voit
 * une page blanche et croit avoir perdu sa progression. Ici on affiche l'erreur,
 * on rappelle que les données sont intactes dans le navigateur, et on offre le
 * seul geste utile — recharger.
 */
interface Etat {
  erreur: Error | null
}

export default class Garde extends Component<{ children: ReactNode }, Etat> {
  override state: Etat = { erreur: null }

  static getDerivedStateFromError(erreur: Error): Etat {
    return { erreur }
  }

  override componentDidCatch(erreur: Error, info: ErrorInfo) {
    console.error('Erreur non rattrapée :', erreur, info.componentStack)
  }

  override render() {
    const { erreur } = this.state
    if (!erreur) return this.props.children

    return (
      <div className="contenu">
        <div className="carte vide" role="alert">
          <p className="vide__icone" aria-hidden="true">
            ⚠
          </p>
          <h2>L'application a rencontré une erreur</h2>
          <p>
            Votre progression est enregistrée dans ce navigateur et n'a pas été perdue. Recharger la
            page devrait suffire.
          </p>
          <pre className="garde__trace">
            {erreur.message}
          </pre>
          <div className="vide__actions">
            <button type="button" className="btn btn--principal" onClick={() => location.reload()}>
              Recharger
            </button>
          </div>
        </div>
      </div>
    )
  }
}
