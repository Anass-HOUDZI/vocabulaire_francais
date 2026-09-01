export default function Contacts() {
  return (
    <div className="carte" style={{ padding: '2rem 1.75rem', maxWidth: '800px', margin: '2rem auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontFamily: 'var(--serif)' }}>Contactez-nous</h2>
      
      <p style={{ color: 'var(--texte-2)', lineHeight: 1.6, marginBottom: '2rem' }}>
        Une question ? Un retour d'expérience ? Notre équipe est là pour vous aider à libérer le plein potentiel de votre vocabulaire.
      </p>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="email" style={{ fontWeight: 600 }}>Votre adresse email</label>
          <input id="email" type="email" placeholder="elon@musk.com" style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--bordure)' }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="message" style={{ fontWeight: 600 }}>Votre message</label>
          <textarea id="message" rows={5} placeholder="Comment pouvons-nous vous aider ?" style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--bordure)', resize: 'vertical' }}></textarea>
        </div>

        <button type="submit" className="btn btn--principal" style={{ alignSelf: 'flex-start', marginTop: '1rem', padding: '0.75rem 2rem' }}>
          Envoyer le message
        </button>
      </form>
    </div>
  )
}
