export default function Legales() {
  return (
    <article className="carte page-contenu-carte">
      <h1 className="section-titre page-contenu-titre">
        Mentions légales & Confidentialité
      </h1>

      <div className="bloc page-contenu-bloc">
        <h3 className="bloc__titre">1. Nature du projet</h3>
        <p className="page-contenu-texte">
          <strong>Lexique</strong> est une application web progressive (PWA) d'apprentissage du
          vocabulaire français soutenu, conçue pour fonctionner de manière autonome, libre et
          entièrement hors-ligne.
        </p>
      </div>

      <div className="bloc page-contenu-bloc">
        <h3 className="bloc__titre">2. Hébergement & Distribution</h3>
        <p className="page-contenu-texte">
          L'application est servie sous forme de fichiers statiques (HTML, CSS, JavaScript) sans
          aucun serveur applicatif ni traitement de données en arrière-plan.
        </p>
      </div>

      <div className="bloc page-contenu-bloc">
        <h3 className="bloc__titre">3. Données personnelles & Souveraineté</h3>
        <p className="page-contenu-texte">
          <strong>Zéro collecte, zéro pistage.</strong> Aucune information personnelle, aucun cookie
          publicitaire, aucune statistique d'usage n'est transmise à qui que ce soit. Votre
          progression, vos cartes et votre historique sont enregistrés exclusivement dans la mémoire
          locale de votre navigateur (<code>localStorage</code>).
        </p>
        <p className="page-contenu-texte">
          Vous conservez le contrôle total de vos données : elles peuvent être exportées sous format
          JSON ou réinitialisées à tout moment depuis la section <em>Réglages</em>.
        </p>
      </div>

      <div className="bloc">
        <h3 className="bloc__titre">4. Corpus & Propriété intellectuelle</h3>
        <p className="page-contenu-texte">
          Le corpus lexical (définitions, transcriptions phonétiques API, exemples contextuels) est
          élaboré dans un but pédagogique et d'étude de la langue française.
        </p>
      </div>
    </article>
  )
}
