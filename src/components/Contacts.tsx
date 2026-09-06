import { useState } from 'react'

export default function Contacts() {
  const [sujet, setSujet] = useState('')
  const [message, setMessage] = useState('')

  const mailtoHref = `mailto:?subject=${encodeURIComponent(
    `[Lexique] ${sujet || 'Retour utilisateur'}`,
  )}&body=${encodeURIComponent(message)}`

  return (
    <article className="carte page-contenu-carte">
      <h1 className="section-titre page-contenu-titre">
        Contact & Retours
      </h1>

      <p className="page-contenu-texte contacts__intro">
        Une suggestion d'enrichissement du corpus, une remarque sur une définition ou un retour
        d'expérience ? Comme <strong>Lexique</strong> fonctionne strictement hors-ligne sans serveur,
        les échanges se font directement par messagerie électronique.
      </p>

      <form
        className="contacts__form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!sujet.trim() && !message.trim()) return
          window.location.href = mailtoHref
        }}
      >
        <div className="contacts__champ-groupe">
          <label htmlFor="sujet" className="champ__label">
            Objet de votre message
          </label>
          <input
            id="sujet"
            type="text"
            className="saisie contacts__saisie"
            maxLength={120}
            placeholder="Ex. : Suggestion pour le mot « Sérendipité », retour sur l'ergonomie..."
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
          />
        </div>

        <div className="contacts__champ-groupe">
          <label htmlFor="message" className="champ__label">
            Votre message
          </label>
          <textarea
            id="message"
            rows={5}
            maxLength={2000}
            className="saisie contacts__textarea"
            placeholder="Partagez vos impressions, remarques ou propositions..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="contacts__actions">
          <button
            type="submit"
            className="btn btn--principal contacts__btn-envoyer"
            disabled={!sujet.trim() && !message.trim()}
          >
            ✉️ Ouvrir dans ma messagerie
          </button>
          <span className="contacts__info-rgpd">
            Génère un courriel pré-rempli sans transmettre de données à un tiers.
          </span>
        </div>
      </form>
    </article>
  )
}
