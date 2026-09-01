interface Props {
  onCommencer: (limiteNouveaux?: number) => void
  onOuvrirLexique: () => void
}

export default function Accueil({ onCommencer, onOuvrirLexique }: Props) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'var(--primaire-clair)', color: 'var(--primaire)', borderRadius: '24px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>
          ✨ Nouveau : +677 mots ajoutés, atteignant 1010 mots premium !
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, fontFamily: 'var(--serif)', maxWidth: '800px', letterSpacing: '-0.03em' }}>
          Maîtrisez le vocabulaire qui <span style={{ color: 'var(--primaire)' }}>fait la différence.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--texte-2)', maxWidth: '600px', lineHeight: 1.5 }}>
          Développez une éloquence redoutable. Lexique est la plateforme d'apprentissage espacé (SRS) pour acquérir un vocabulaire soutenu, exigeant et nuancé en 10 minutes par jour.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="button" className="btn btn--principal" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '30px' }} onClick={() => onCommencer()}>
            Démarrer l'essai gratuit
          </button>
          <button type="button" className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '30px', background: 'transparent', border: '1px solid var(--bordure)' }} onClick={onOuvrirLexique}>
            Découvrir le lexique
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--texte-3)', marginTop: '0.5rem' }}>
          Aucune carte de crédit requise. Tout est stocké localement.
        </p>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--serif)' }}>L'outil ultime pour votre rhétorique</h2>
          <p style={{ color: 'var(--texte-2)', fontSize: '1.1rem' }}>Découvrez pourquoi les leaders et écrivains choisissent Lexique.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="carte" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Répétition espacée (SRS)</h3>
            <p style={{ color: 'var(--texte-2)' }}>Notre algorithme s'adapte à votre mémoire. Ne révisez que les mots que vous êtes sur le point d'oublier, pour un ancrage définitif.</p>
          </div>
          <div className="carte" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Corpus d'élite</h3>
            <p style={{ color: 'var(--texte-2)' }}>1010 mots soigneusement sélectionnés et calibrés. Fini les listes de vocabulaire scolaires, passez au niveau supérieur.</p>
          </div>
          <div className="carte" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Micro-learning</h3>
            <p style={{ color: 'var(--texte-2)' }}>10 minutes par jour suffisent. Intégrez l'apprentissage dans votre routine matinale ou vos trajets pour des résultats exponentiels.</p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: '4rem 0', textAlign: 'center', background: 'var(--fond-carte)', borderRadius: '24px', margin: '2rem 0' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', fontFamily: 'var(--serif)' }}>Adoptez le langage des 1%</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
          <div style={{ maxWidth: '300px', textAlign: 'left' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--texte-2)', marginBottom: '1rem' }}>"Lexique a transformé ma façon de rédiger mes essais. C'est l'arme secrète de ma startup."</p>
            <div style={{ fontWeight: 600 }}>Marie L.</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--texte-3)' }}>Fondatrice, TechFlow</div>
          </div>
          <div style={{ maxWidth: '300px', textAlign: 'left' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--texte-2)', marginBottom: '1rem' }}>"Un design épuré, une efficacité redoutable. Je ne rate plus une seule session de révision."</p>
            <div style={{ fontWeight: 600 }}>Julien D.</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--texte-3)' }}>Copywriter</div>
          </div>
        </div>
      </section>
      
      {/* Footer minimaliste SaaS */}
      <footer style={{ padding: '4rem 0 2rem', borderTop: '1px solid var(--bordure)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 1rem' }}>Lexique.</h2>
          <p style={{ color: 'var(--texte-3)', maxWidth: '300px', fontSize: '0.9rem' }}>L'excellence lexicale au bout des doigts, pour ceux qui bâtissent demain.</p>
        </div>
        <div style={{ display: 'flex', gap: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <strong style={{ marginBottom: '0.5rem' }}>Produit</strong>
            <button onClick={onOuvrirLexique} style={{ background: 'none', border: 'none', color: 'var(--texte-2)', cursor: 'pointer', textAlign: 'left' }}>Explorer</button>
            <button onClick={() => onCommencer()} style={{ background: 'none', border: 'none', color: 'var(--texte-2)', cursor: 'pointer', textAlign: 'left' }}>S'entraîner</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <strong style={{ marginBottom: '0.5rem' }}>Société</strong>
            <a href="#legales" style={{ color: 'var(--texte-2)', textDecoration: 'none' }}>Mentions légales</a>
            <a href="#contacts" style={{ color: 'var(--texte-2)', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
