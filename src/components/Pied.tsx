import type { Onglet } from '../App'

interface Props {
  onglet?: Onglet
  onChange: (o: Onglet) => void
}

export default function Pied({ onglet, onChange }: Props) {
  const annee = new Date().getFullYear()

  const allerEnHaut = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="pied">
      <div className="pied__conteneur">
        <div className="pied__grille">
          {/* Colonne 1 : Marque & Vision */}
          <div className="pied__colonne pied__colonne--marque">
            <button
              type="button"
              onClick={() => {
                onChange('accueil')
                allerEnHaut()
              }}
              className="pied__marque-btn"
              aria-label="Retour à l'accueil"
            >
              <span className="marque pied__marque">
                Lexique<span>.</span>
              </span>
            </button>
            <p className="pied__description">
              Édition littéraire et mémorisation espacée du vocabulaire français avancé.
              Conçu pour l'exigence des concours, la précision rédactionnelle et le plaisir des belles-lettres.
            </p>
            <div className="pied__engagements">
              <span className="pied__pastille-engagement">100% Hors-ligne</span>
              <span className="pied__pastille-engagement">Zéro traceur</span>
              <span className="pied__pastille-engagement">Données souveraines</span>
            </div>
          </div>

          {/* Colonne 2 : Navigation principale */}
          <div className="pied__colonne">
            <h3 className="pied__titre-colonne">Navigation</h3>
            <ul className="pied__liens">
              <li>
                <button
                  type="button"
                  className={`pied__lien ${onglet === 'accueil' ? 'pied__lien--actif' : ''}`}
                  onClick={() => {
                    onChange('accueil')
                    allerEnHaut()
                  }}
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`pied__lien ${onglet === 'reviser' ? 'pied__lien--actif' : ''}`}
                  onClick={() => {
                    onChange('reviser')
                    allerEnHaut()
                  }}
                >
                  Session de révision
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`pied__lien ${onglet === 'lexique' ? 'pied__lien--actif' : ''}`}
                  onClick={() => {
                    onChange('lexique')
                    allerEnHaut()
                  }}
                >
                  Lexique complet (1 010 mots)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`pied__lien ${onglet === 'progression' ? 'pied__lien--actif' : ''}`}
                  onClick={() => {
                    onChange('progression')
                    allerEnHaut()
                  }}
                >
                  Progression & Maîtrise
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`pied__lien ${onglet === 'reglages' ? 'pied__lien--actif' : ''}`}
                  onClick={() => {
                    onChange('reglages')
                    allerEnHaut()
                  }}
                >
                  Réglages & Sauvegardes
                </button>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Méthodologie & Corpus */}
          <div className="pied__colonne">
            <h3 className="pied__titre-colonne">Méthode & Corpus</h3>
            <ul className="pied__liens">
              <li>
                <span className="pied__texte-info">
                  <strong>Répétition espacée</strong> : Algorithme SM-2 à 4 paliers d'ancrage.
                </span>
              </li>
              <li>
                <span className="pied__texte-info">
                  <strong>Phonétique exacte</strong> : Alphabet Phonétique International (API).
                </span>
              </li>
              <li>
                <span className="pied__texte-info">
                  <strong>Citations authentiques</strong> : Extraits littéraires vérifiés.
                </span>
              </li>
              <li>
                <span className="pied__texte-info">
                  <strong>Alertes d'usage</strong> : Détection des pièges et mésusages.
                </span>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Transparence & Éthique */}
          <div className="pied__colonne">
            <h3 className="pied__titre-colonne">Transparence</h3>
            <ul className="pied__liens">
              <li>
                <button
                  type="button"
                  className={`pied__lien ${onglet === 'legales' ? 'pied__lien--actif' : ''}`}
                  onClick={() => {
                    onChange('legales')
                    allerEnHaut()
                  }}
                >
                  Mentions légales & Confidentialité
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`pied__lien ${onglet === 'contacts' ? 'pied__lien--actif' : ''}`}
                  onClick={() => {
                    onChange('contacts')
                    allerEnHaut()
                  }}
                >
                  Contact & Retours
                </button>
              </li>
              <li>
                <span className="pied__texte-info">
                  Accessibilité WCAG 2.2 AA (100% conforme)
                </span>
              </li>
              <li>
                <span className="pied__texte-info">
                  Application Web Progressive (PWA)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne inférieure */}
        <div className="pied__bas">
          <p className="pied__copyright">
            © {annee} <strong>Lexique</strong> — Projet libre d'apprentissage lexical, sans publicité ni télémétrie.
          </p>

          <p className="pied__aphorisme">
            « La précision du mot est la politesse de l'esprit. »
          </p>

          <button
            type="button"
            className="pied__remonter-btn"
            onClick={allerEnHaut}
            aria-label="Remonter en haut de la page"
          >
            <span>Haut de page</span>
            <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
