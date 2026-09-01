export default function Legales() {
  return (
    <div className="carte" style={{ padding: '2rem 1.75rem', maxWidth: '800px', margin: '2rem auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontFamily: 'var(--serif)' }}>Mentions Légales</h2>
      
      <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1.25rem' }}>1. Éditeur du site</h3>
      <p style={{ color: 'var(--texte-2)', lineHeight: 1.6 }}>
        Ce site est édité et maintenu par Vocabulaire SAAS Startup.<br/>
        Email : contact@vocabulaire-startup.com
      </p>

      <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1.25rem' }}>2. Hébergement</h3>
      <p style={{ color: 'var(--texte-2)', lineHeight: 1.6 }}>
        L'hébergement est assuré par nos serveurs ultra-sécurisés garantissant une disponibilité de 99.99%.
      </p>

      <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1.25rem' }}>3. Données personnelles</h3>
      <p style={{ color: 'var(--texte-2)', lineHeight: 1.6 }}>
        Toutes vos données de progression restent stockées localement sur votre appareil. Nous ne collectons, ni ne partageons, aucune donnée personnelle avec des tiers.
      </p>
    </div>
  )
}
