import { useState } from 'react'

interface Props {
  onCommencer: (limiteNouveaux?: number) => void
  onOuvrirLexique: () => void
}

interface MotEchantillon {
  mot: string
  cat: string
  api: string
  def: string
  exemple: string
}

interface ThemeRegistre {
  nom: string
  icone: string
  description: string
  mots: MotEchantillon[]
}

const REGISTRES_DATA: ThemeRegistre[] = [
  {
    nom: 'Pensée & Rhétorique',
    icone: '🏛️',
    description: 'Armez vos argumentations, structurez vos raisonnements et déjouez les sophismes.',
    mots: [
      {
        mot: 'captieux',
        cat: 'adj.',
        api: '/kap.sjø/',
        def: 'Qui cherche à tromper ou à induire en erreur sous une apparence séduisante de vérité.',
        exemple: 'Un argument captieux destiné à détourner l’attention des véritables enjeux.',
      },
      {
        mot: 'aporie',
        cat: 'nom f.',
        api: '/a.pɔ.ʁi/',
        def: 'Difficulté logique apparemment insoluble qui paralyse la progression du raisonnement.',
        exemple: 'Le débat philosophique débouchait sur une aporie féconde.',
      },
      {
        mot: 'péremptoire',
        cat: 'adj.',
        api: '/pe.ʁɑ̃p.twaʁ/',
        def: 'Contre lequel on ne peut répliquer ; qui détruit d’avance toute objection possible.',
        exemple: 'Une réplique péremptoire qui trancha net la controverse.',
      },
      {
        mot: 'fallacieux',
        cat: 'adj.',
        api: '/fa.la.sjø/',
        def: 'Trompeur, insidieux, fondé sur une fausse apparence propre à abuser la confiance.',
        exemple: 'Une promesse fallacieuse qui masquait un renoncement.',
      },
    ],
  },
  {
    nom: 'Caractère & Humeurs',
    icone: '🎭',
    description: 'Dépistez avec finesse les replis de l’âme humaine, des travers aux plus hautes vertus.',
    mots: [
      {
        mot: 'acariâtre',
        cat: 'adj.',
        api: '/a.ka.ʁjatʁ/',
        def: 'D’une humeur difficile et querelleuse, trouvant à redire à tout et rendant le commerce pénible.',
        exemple: 'Un hôte acariâtre que la moindre contrariété plongeait dans le ressentiment.',
      },
      {
        mot: 'abhorrer',
        cat: 'verbe',
        api: '/a.bɔ.ʁe/',
        def: 'Éprouver pour quelque chose ou quelqu’un une aversion morale et viscérale absolue.',
        exemple: 'Magistrat intègre, il abhorrait les complaisances serviles.',
      },
      {
        mot: 'pusillanime',
        cat: 'adj.',
        api: '/py.zi.la.nim/',
        def: 'Qui manque d’audace et de courage moral, craignant excessivement le risque et le blâme.',
        exemple: 'Une reculade pusillanime devant les récriminations de la foule.',
      },
      {
        mot: 'magnanime',
        cat: 'adj.',
        api: '/ma.ɲa.nim/',
        def: 'Qui témoigne d’une grandeur d’âme généreuse, pardonnant avec noblesse et sans aigreur.',
        exemple: 'Un geste magnanime qui désarma ses opposants les plus farouches.',
      },
    ],
  },
  {
    nom: 'Style & Perception',
    icone: '🖋️',
    description: 'Affûtez votre plume et saisissez l’impalpable dans vos descriptions et vos jugements.',
    mots: [
      {
        mot: 'acuité',
        cat: 'nom f.',
        api: '/a.kɥi.te/',
        def: 'Finesse extrême d’un sens ou de l’esprit permettant de distinguer des nuances invisibles.',
        exemple: 'L’acuité de son oreille décelait la moindre altération dans la résonance du violon.',
      },
      {
        mot: 'mièvre',
        cat: 'adj.',
        api: '/mjɛvʁ/',
        def: 'Qui pèche par un excès de fadeur, de gentillesse mièvre ou de naïveté apprêtée.',
        exemple: 'Une mise en scène mièvre qui ôtait toute gravité à la tragédie.',
      },
      {
        mot: 'chamarré',
        cat: 'adj.',
        api: '/ʃa.ma.ʁe/',
        def: 'Rehaussé d’ornements éclatants, richement chamarré de couleurs vives ou d’adjectifs rares.',
        exemple: 'Une prose chamarrée qui rappelait les étoffes baroques.',
      },
      {
        mot: 'truculent',
        cat: 'adj.',
        api: '/tʁy.ky.lɑ̃/',
        def: 'Haut en couleur, d’un réalisme vigoureux et plein d’une verve populaire et pittoresque.',
        exemple: 'Un récit truculent où chaque dialogue déborde de verdeur.',
      },
    ],
  },
  {
    nom: 'Société & Pouvoir',
    icone: '⚖️',
    description: 'Nommez les institutions, les mécanismes d’influence et l’exercice souverain de l’État.',
    mots: [
      {
        mot: 'forfaiture',
        cat: 'nom f.',
        api: '/fɔʁ.fɛ.tyʁ/',
        def: 'Faute particulièrement lourde commise par un magistrat ou fonctionnaire dans ses fonctions.',
        exemple: 'La dissimulation de preuves fut qualifiée de forfaiture devant la cour.',
      },
      {
        mot: 'concussion',
        cat: 'nom f.',
        api: '/kɔ̃.ky.sjɔ̃/',
        def: 'Malversation d’un dépositaire public qui perçoit des droits ou des sommes indues.',
        exemple: 'Une commission spéciale pour enrayer la concussion aux frontières.',
      },
      {
        mot: 'prérogative',
        cat: 'nom f.',
        api: '/pʁe.ʁɔ.ga.tiv/',
        def: 'Avantage exclusif, pouvoir ou privilège attaché par droit ou coutume à un rang ou une charge.',
        exemple: 'Défendre les prérogatives du parlement face aux empiétements de l’exécutif.',
      },
      {
        mot: 'hégémonie',
        cat: 'nom f.',
        api: '/e.ʒe.mɔ.ni/',
        def: 'Suprématie exercée par un État, une doctrine ou un groupe sur d’autres.',
        exemple: 'Contester l’hégémonie doctrinale d’une école de pensée dominante.',
      },
    ],
  },
]

const CITATIONS_FLORILEGE = [
  {
    texte: "« Ce qui se conçoit bien s'énonce clairement, et les mots pour le dire arrivent aisément. »",
    auteur: 'Nicolas Boileau',
    oeuvre: "L'Art poétique, 1674",
    portee: "De la limpidité de la pensée naît l'évidence du terme juste.",
  },
  {
    texte: "« La parole est moitié à celui qui parle, moitié à celui qui l'écoute. »",
    auteur: 'Michel de Montaigne',
    oeuvre: 'Les Essais, 1580',
    portee: "L'éloquence est un pacte d'intelligence et de respect de l'auditoire.",
  },
  {
    texte: "« Le véritable voyage de découverte ne consiste pas à chercher de nouveaux paysages, mais à avoir de nouveaux yeux. »",
    auteur: 'Marcel Proust',
    oeuvre: 'À la recherche du temps perdu, 1923',
    portee: "Chaque mot noble élargit la perception du monde et de la sensibilité.",
  },
]

export default function Accueil({ onCommencer, onOuvrirLexique }: Props) {
  const [audioActif, setAudioActif] = useState(false)
  const [themeIndex, setThemeIndex] = useState(0)
  const [motIndex, setMotIndex] = useState(0)
  const [quizReponse, setQuizReponse] = useState<string | null>(null)
  const [citationIndex, setCitationIndex] = useState(0)

  const prononcerSpecimen = (mot: string = 'acuité') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(mot)
      u.lang = 'fr-FR'
      u.rate = 0.9
      setAudioActif(true)
      u.onend = () => setAudioActif(false)
      u.onerror = () => setAudioActif(false)
      window.speechSynthesis.speak(u)
    }
  }

  const themeActuel = REGISTRES_DATA[themeIndex] ?? REGISTRES_DATA[0]!
  const motActuel = themeActuel.mots[motIndex] ?? themeActuel.mots[0]!
  const citationActuelle = CITATIONS_FLORILEGE[citationIndex] ?? CITATIONS_FLORILEGE[0]!

  return (
    <div className="accueil">
      {/* 1. Hero Section */}
      <section className="accueil__hero">
        <div className="accueil__hero-contenu">
          <div className="accueil__badge">
            <span className="accueil__badge-point" aria-hidden="true" />
            <span>1 010 chefs-d'œuvre du lexique · Mémorisation SM-2</span>
          </div>

          <h1 className="accueil__titre">
            L'art du mot juste, <span className="accueil__titre-emphase">gravé dans votre mémoire</span>.
          </h1>

          <p className="accueil__chapeau">
            Bannissez les hésitations et les approximations. Grâce à l'algorithme de répétition
            espacée et un corpus d'exception scrupuleusement contextualisé, développez une éloquence
            naturelle, précise et souveraine.
          </p>

          <div className="accueil__actions">
            <div className="accueil__actions-groupe">
              <button
                type="button"
                className="btn btn--principal accueil__btn-action accueil__btn-principal"
                onClick={() => onCommencer(5)}
              >
                <span className="accueil__btn-symbole" aria-hidden="true">✦</span>
                <span>Découvrir 5 mots</span>
                <span className="accueil__btn-fleche" aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                className="btn accueil__btn-action accueil__btn-secondaire"
                onClick={onOuvrirLexique}
              >
                <span className="accueil__btn-icone-livre" aria-hidden="true">📖</span>
                <span>Parcourir le lexique</span>
                <span className="pastille pastille--subtile" aria-hidden="true">1 010</span>
              </button>
            </div>
          </div>

          <div className="accueil__reassurance">
            <span className="accueil__reassurance-item">
              <span className="accueil__reassurance-icone" aria-hidden="true">✦</span>
              <span>100% Hors-ligne & Libre</span>
            </span>
            <span className="accueil__reassurance-item">
              <span className="accueil__reassurance-icone" aria-hidden="true">🧠</span>
              <span>Répétition SM-2 certifiée</span>
            </span>
            <span className="accueil__reassurance-item">
              <span className="accueil__reassurance-icone" aria-hidden="true">⏱️</span>
              <span>3 min par session</span>
            </span>
            <span className="accueil__reassurance-item">
              <span className="accueil__reassurance-icone" aria-hidden="true">🛡️</span>
              <span>Zéro compte, zéro traceur</span>
            </span>
          </div>
        </div>

        {/* Visuel interactif du héros : Carte Spécimen vivante */}
        <div className="accueil__hero-visuel">
          <div className="accueil__hero-halo" aria-hidden="true" />
          <div className="carte accueil__specimen-carte">
            <div className="accueil__specimen-entete">
              <span className="accueil__specimen-rubrique">SPÉCIMEN DU JOUR</span>
              <div className="accueil__specimen-meta">
                <span className="accueil__specimen-tag">Soutenu</span>
                <button
                  type="button"
                  className={`btn--icone btn--discret accueil__specimen-audio ${audioActif ? 'btn--audio-actif' : ''}`}
                  onClick={() => prononcerSpecimen('acuité')}
                  aria-label="Écouter la prononciation du mot acuité"
                >
                  <span className={audioActif ? 'onde-audio' : ''} aria-hidden="true">🔊</span>
                </button>
              </div>
            </div>

            <div className="accueil__specimen-corps">
              <div className="accueil__specimen-titre-ligne">
                <span className="accueil__specimen-vedette">acuité</span>
                <span className="accueil__specimen-cat">nom f.</span>
              </div>

              <div className="accueil__specimen-phonetique">
                <span className="api">/a.kɥi.te/</span>
                <span className="syllabes">
                  <b>a</b><b>kɥi</b><b>te</b>
                </span>
              </div>

              <p className="accueil__specimen-definition">
                Finesse extrême d'un sens ou de l'esprit, qui permet de saisir des nuances imperceptibles au commun.
              </p>

              <div className="accueil__specimen-citation">
                <p>« L'enquête doit sa force à l'acuité du regard porté sur les travers ordinaires. »</p>
              </div>

              <div className="accueil__specimen-srs-apercu">
                <span className="accueil__specimen-srs-label">Paliers de mémorisation SRS</span>
                <div className="accueil__specimen-paliers">
                  <span className="accueil__palier">À revoir</span>
                  <span className="accueil__palier">Difficile</span>
                  <span className="accueil__palier accueil__palier--actif">Bon (4 j)</span>
                  <span className="accueil__palier">Parfait (7 j)</span>
                </div>
              </div>
            </div>

            <div className="accueil__specimen-pastille-flottante">
              <span className="accueil__point-vert" aria-hidden="true" /> Algorithme actif
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bandeau Chiffres Clés & Autorité Lexicale */}
      <section className="carte accueil__stats" aria-label="Statistiques clés du lexique">
        <div className="accueil__stat-item">
          <span className="accueil__stat-chiffre">1 010</span>
          <span className="accueil__stat-libelle">Termes souverains</span>
          <span className="accueil__stat-precision">Trisyllabiques, issus des grands auteurs</span>
        </div>
        <div className="accueil__stat-separateur" aria-hidden="true" />
        <div className="accueil__stat-item">
          <span className="accueil__stat-chiffre">SM-2</span>
          <span className="accueil__stat-libelle">Algorithme cognitif</span>
          <span className="accueil__stat-precision">Rétention pérenne &gt; 92%</span>
        </div>
        <div className="accueil__stat-separateur" aria-hidden="true" />
        <div className="accueil__stat-item">
          <span className="accueil__stat-chiffre">100%</span>
          <span className="accueil__stat-libelle">Phonétique API</span>
          <span className="accueil__stat-precision">Découpage syllabique & audio</span>
        </div>
        <div className="accueil__stat-separateur" aria-hidden="true" />
        <div className="accueil__stat-item">
          <span className="accueil__stat-chiffre">0 octet</span>
          <span className="accueil__stat-libelle">Télémétrie ou tiers</span>
          <span className="accueil__stat-precision">100% hors-ligne & souverain</span>
        </div>
      </section>

      {/* 3. Piliers pédagogiques */}
      <section className="accueil__piliers" aria-label="Points forts de la méthode">
        <div className="accueil__section-entete">
          <span className="accueil__kicker">MÉTHODE & RIGUEUR</span>
          <h2 className="accueil__section-titre">L'Excellence au service du mot juste</h2>
          <p className="accueil__section-chapeau">
            Une synthèse féconde entre sciences cognitives de l'apprentissage et haute tradition
            des dictionnaires littéraires de référence.
          </p>
        </div>

        <div className="accueil__grille">
          {/* Pilier I */}
          <article className="carte accueil__carte-pilier">
            <div className="accueil__carte-tete">
              <div className="accueil__carte-sceau" aria-hidden="true">
                <span className="accueil__carte-icone">🧠</span>
              </div>
            </div>
            <h3 className="accueil__carte-titre">Répétition espacée (SM-2)</h3>
            <p className="accueil__carte-sous-titre">Ancrage mémoriel calculé par intervalle exponentiel</p>
            <p className="accueil__carte-texte">
              L'algorithme calcule le moment précis où un mot risque de s'effacer pour vous le
              représenter au moment critique. Zéro bourrage de crâne, rétention maximale.
            </p>
            <div className="accueil__carte-etiquettes">
              <span className="accueil__etiquette">4 paliers SRS</span>
              <span className="accueil__etiquette">Sans surcharge</span>
            </div>
          </article>

          {/* Pilier II */}
          <article className="carte accueil__carte-pilier">
            <div className="accueil__carte-tete">
              <div className="accueil__carte-sceau" aria-hidden="true">
                <span className="accueil__carte-icone">📖</span>
              </div>
            </div>
            <h3 className="accueil__carte-titre">Corpus d'exception</h3>
            <p className="accueil__carte-sous-titre">1 010 termes soutenus, citations & phonétique API</p>
            <p className="accueil__carte-texte">
              Chaque mot offre sa définition rigoureuse, sa prononciation en alphabet phonétique international,
              ses citations en contexte et une mise en garde contre les mésusages courants.
            </p>
            <div className="accueil__carte-etiquettes">
              <span className="accueil__etiquette">Littré & Académie</span>
              <span className="accueil__etiquette">Alphabet API</span>
            </div>
          </article>

          {/* Pilier III */}
          <article className="carte accueil__carte-pilier">
            <div className="accueil__carte-tete">
              <div className="accueil__carte-sceau" aria-hidden="true">
                <span className="accueil__carte-icone">⏳</span>
              </div>
            </div>
            <h3 className="accueil__carte-titre">Micro-apprentissage</h3>
            <p className="accueil__carte-sous-titre">5 à 10 minutes de concentration quotidienne</p>
            <p className="accueil__carte-texte">
              Une routine intellectuelle brève, noble et sans distraction commerciale.
              Idéale pour les trajets, les pauses d'étude et la préparation aux épreuves écrites et orales.
            </p>
            <div className="accueil__carte-etiquettes">
              <span className="accueil__etiquette">Session courte</span>
              <span className="accueil__etiquette">Mobile & Bureau</span>
            </div>
          </article>

          {/* Pilier IV */}
          <article className="carte accueil__carte-pilier">
            <div className="accueil__carte-tete">
              <div className="accueil__carte-sceau" aria-hidden="true">
                <span className="accueil__carte-icone">🔒</span>
              </div>
            </div>
            <h3 className="accueil__carte-titre">Souveraineté & Hors-ligne</h3>
            <p className="accueil__carte-sous-titre">Autonomie absolue sans compte ni télémétrie</p>
            <p className="accueil__carte-texte">
              Application Web Progressive (PWA) fonctionnant en mode avion. Aucune donnée ne quitte
              jamais votre appareil, avec export et sauvegarde JSON en un clic.
            </p>
            <div className="accueil__carte-etiquettes">
              <span className="accueil__etiquette">100% Hors-ligne</span>
              <span className="accueil__etiquette">Export JSON</span>
            </div>
          </article>
        </div>
      </section>

      {/* 4. Le Rituel Quotidien en 3 Étapes avec Mini-Quiz Interactif */}
      <section className="accueil__rituel" aria-label="Le rituel quotidien en trois étapes">
        <div className="accueil__section-entete">
          <span className="accueil__kicker">PARCOURS D'APPRENTISSAGE</span>
          <h2 className="accueil__section-titre">Le Rituel Quotidien en Trois Gestes</h2>
          <p className="accueil__section-chapeau">
            Une discipline douce et rigoureuse pour passer de la simple reconnaissance passive à
            l'usage actif et naturel des mots les plus prestigieux.
          </p>
        </div>

        <div className="accueil__rituel-grille">
          {/* Étape 1 */}
          <div className="carte accueil__etape-carte">
            <div className="accueil__etape-badge">1</div>
            <span className="accueil__etape-sur-titre">DÉCOUVERTE</span>
            <h3 className="accueil__etape-titre">Rencontrer & Écouter</h3>
            <p className="accueil__etape-texte">
              Découvrez la carte du jour : son timbre sonore en alphabet phonétique international,
              son étymologie fondatrice et sa définition sans ambiguïté.
            </p>
            <div className="accueil__etape-apercu">
              <div className="accueil__etape-tag-mot">
                <span className="accueil__etape-vedette">captieux</span>
                <span className="api">/kap.sjø/</span>
              </div>
              <p className="accueil__etape-extrait">
                Du latin <em>captiosus</em>, « propre à faire tomber dans un piège ».
              </p>
            </div>
          </div>

          {/* Étape 2 (Mini-Quiz Interactif) */}
          <div className="carte accueil__etape-carte accueil__etape-carte--vedette">
            <div className="accueil__etape-badge">2</div>
            <span className="accueil__etape-sur-titre">MISE EN SITUATION</span>
            <h3 className="accueil__etape-titre">Éprouver en Contexte</h3>
            <p className="accueil__etape-texte">
              Le mot n'est jamais isolé. Complétez la phrase littéraire pour distinguer la nuance juste
              des faux-amis :
            </p>

            <div className="accueil__mini-quiz">
              <p className="accueil__mini-quiz-phrase">
                « Intègre et intransigeante, elle ___ les compromissions officieuses en coulisses. »
              </p>
              <div className="accueil__mini-quiz-options">
                {(['abhorrait', 'sollicitait', 'prisait'] as const).map((reponse) => {
                  const estChoisi = quizReponse === reponse
                  const estJuste = reponse === 'abhorrait'
                  return (
                    <button
                      key={reponse}
                      type="button"
                      className={`accueil__mini-quiz-btn ${
                        estChoisi
                          ? estJuste
                            ? 'accueil__mini-quiz-btn--juste'
                            : 'accueil__mini-quiz-btn--faux'
                          : ''
                      }`}
                      onClick={() => setQuizReponse(reponse)}
                    >
                      <span>{reponse}</span>
                      {estChoisi && <span aria-hidden="true">{estJuste ? ' ✓' : ' ✗'}</span>}
                    </button>
                  )
                })}
              </div>
              {quizReponse && (
                <div className="accueil__mini-quiz-feedback" role="status">
                  {quizReponse === 'abhorrait' ? (
                    <p className="feedback-succes">
                      <strong>✓ Parfaitement vu !</strong> <em>Abhorrer</em> marque le degré suprême du rejet moral
                      et ne souffre aucune atténuation.
                    </p>
                  ) : (
                    <p className="feedback-erreur">
                      <strong>✗ Distracteur !</strong> Le verbe attendu était <em>abhorrait</em> (haine viscérale).
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Étape 3 */}
          <div className="carte accueil__etape-carte">
            <div className="accueil__etape-badge">3</div>
            <span className="accueil__etape-sur-titre">CONSOLIDATION</span>
            <h3 className="accueil__etape-titre">Ancrer avec le SM-2</h3>
            <p className="accueil__etape-texte">
              Auto-évaluez votre effort de rappel. L'algorithme calcule le moment optimal où le mot
              doit réapparaître avant de sombrer dans l'oubli.
            </p>
            <div className="accueil__srs-chronologie">
              <div className="accueil__srs-jalons">
                <span className="accueil__srs-jalon">J+1</span>
                <span className="accueil__srs-fleche" aria-hidden="true">→</span>
                <span className="accueil__srs-jalon">J+4</span>
                <span className="accueil__srs-fleche" aria-hidden="true">→</span>
                <span className="accueil__srs-jalon accueil__srs-jalon--actif">J+12</span>
                <span className="accueil__srs-fleche" aria-hidden="true">→</span>
                <span className="accueil__srs-jalon">J+30</span>
              </div>
              <span className="accueil__srs-explication">Intervalles exponentiels calculés</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. La Science de la Mémoire : Courbe d'Ebbinghaus vs SM-2 */}
      <section className="carte accueil__science" aria-label="La science de la répétition espacée">
        <div className="accueil__science-grille">
          <div className="accueil__science-texte">
            <span className="accueil__kicker">SCIENCES COGNITIVES</span>
            <h2 className="accueil__section-titre">La Répétition Espacée contre la Fatalité de l'Oubli</h2>
            <p className="accueil__science-paragraphe">
              Dès 1885, le psychologue Hermann Ebbinghaus quantifiait la <strong>courbe de l'oubli</strong> :
              sans réactivation ciblée, un terme nouveau perd <strong>80% de sa clarté en six jours</strong>.
            </p>
            <p className="accueil__science-paragraphe">
              L'algorithme SM-2 brise cette fatalité : chaque révision intervient au moment exact où la
              mémoire vacille, aplatissant la courbe de déperdition jusqu'à fixer le mot de façon permanente.
            </p>

            <div className="accueil__science-points">
              <div className="accueil__science-point">
                <span className="accueil__point-icone" aria-hidden="true">📈</span>
                <div>
                  <strong>Effort dégressif</strong>
                  <p>Plus un mot est ancré, plus ses intervalles s'espacent (jusqu'à plusieurs mois).</p>
                </div>
              </div>
              <div className="accueil__science-point">
                <span className="accueil__point-icone" aria-hidden="true">⚡</span>
                <div>
                  <strong>Zéro saturation</strong>
                  <p>Seuls les mots fragiles sont réclamés : votre temps d'étude reste sous les 10 minutes.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="accueil__science-graphique-cadre" aria-label="Graphique comparant la courbe d'amnésie et les réactivations SM-2">
            <div className="accueil__science-graphique-legende">
              <span className="legende-item legende-item--sm2">
                <span className="legende-ligne legende-ligne--sm2" aria-hidden="true" /> Avec SM-2 (Rétention &gt; 90%)
              </span>
              <span className="legende-item legende-item--oubli">
                <span className="legende-ligne legende-ligne--oubli" aria-hidden="true" /> Sans révision (Oubli classique)
              </span>
            </div>

            <svg
              className="accueil__science-svg"
              viewBox="0 0 460 260"
              role="img"
              aria-label="Représentation de la courbe de rétention avec répétition espacée"
            >
              {/* Axes et grilles douces */}
              <line x1="45" y1="20" x2="45" y2="220" stroke="var(--bordure)" strokeWidth="1.5" />
              <line x1="45" y1="220" x2="440" y2="220" stroke="var(--bordure)" strokeWidth="1.5" />
              
              {/* Repères % */}
              <text x="38" y="30" textAnchor="end" fontSize="11" fill="var(--texte-3)">100%</text>
              <text x="38" y="125" textAnchor="end" fontSize="11" fill="var(--texte-3)">50%</text>
              <text x="38" y="224" textAnchor="end" fontSize="11" fill="var(--texte-3)">0%</text>

              {/* Repères jours */}
              <text x="50" y="240" textAnchor="middle" fontSize="11" fill="var(--texte-3)">J0</text>
              <text x="140" y="240" textAnchor="middle" fontSize="11" fill="var(--texte-3)">J+1</text>
              <text x="230" y="240" textAnchor="middle" fontSize="11" fill="var(--texte-3)">J+4</text>
              <text x="330" y="240" textAnchor="middle" fontSize="11" fill="var(--texte-3)">J+12</text>
              <text x="420" y="240" textAnchor="middle" fontSize="11" fill="var(--texte-3)">J+30</text>

              {/* Ligne pointillée : Chute de l'oubli classique */}
              <path
                d="M 50 30 Q 80 160 140 190 T 430 215"
                fill="none"
                stroke="var(--erreur)"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.75"
              />

              {/* Courbe SM-2 avec rebonds successifs */}
              <path
                d="M 50 30 Q 85 110 140 125 L 140 35 Q 185 85 230 95 L 230 35 Q 280 65 330 70 L 330 35 Q 380 48 435 50"
                fill="none"
                stroke="var(--succes)"
                strokeWidth="3"
              />

              {/* Points de rappel SM-2 */}
              <circle cx="50" cy="30" r="4" fill="var(--accent)" />
              <circle cx="140" cy="35" r="4" fill="var(--accent)" />
              <circle cx="230" cy="35" r="4" fill="var(--accent)" />
              <circle cx="330" cy="35" r="4" fill="var(--accent)" />

              {/* Étiquette d'ancrage définitif */}
              <rect x="345" y="15" width="85" height="22" rx="4" fill="var(--succes-doux)" stroke="var(--succes)" strokeWidth="1" />
              <text x="387" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--succes)">
                Ancrage durable
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* 6. Échantillons Vivants du Lexique & Registres */}
      <section className="accueil__echantillons" aria-label="Exploration des registres de langue">
        <div className="accueil__section-entete">
          <span className="accueil__kicker">CORPUS SOUVERAIN</span>
          <h2 className="accueil__section-titre">Explorez les Quatre Registres Majeurs</h2>
          <p className="accueil__section-chapeau">
            Chaque mot a été sélectionné pour sa dignité littéraire, sa précision chirurgicale et son
            potentiel d'illumination stylistique.
          </p>
        </div>

        {/* Onglets thématiques */}
        <div className="accueil__registres-onglets" role="tablist" aria-label="Registres du lexique">
          {REGISTRES_DATA.map((reg, idx) => (
            <button
              key={reg.nom}
              type="button"
              role="tab"
              aria-selected={themeIndex === idx}
              className={`accueil__registre-onglet ${themeIndex === idx ? 'accueil__registre-onglet--actif' : ''}`}
              onClick={() => {
                setThemeIndex(idx)
                setMotIndex(0)
              }}
            >
              <span aria-hidden="true">{reg.icone}</span>
              <span>{reg.nom}</span>
            </button>
          ))}
        </div>

        {/* Panneau du registre sélectionné */}
        <div className="carte accueil__registre-panneau" role="tabpanel">
          <div className="accueil__registre-entete">
            <p className="accueil__registre-description">{themeActuel.description}</p>
            <div className="accueil__mots-chips">
              {themeActuel.mots.map((m, mIdx) => (
                <button
                  key={m.mot}
                  type="button"
                  className={`accueil__mot-chip ${motIndex === mIdx ? 'accueil__mot-chip--actif' : ''}`}
                  onClick={() => setMotIndex(mIdx)}
                >
                  <span>{m.mot}</span>
                  <span className="accueil__mot-chip-cat">{m.cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fiche détaillée du mot prévisualisé */}
          <div className="accueil__mot-detail">
            <div className="accueil__mot-detail-ligne">
              <div className="accueil__mot-detail-titre">
                <span className="accueil__mot-detail-nom">{motActuel.mot}</span>
                <span className="accueil__mot-detail-cat">{motActuel.cat}</span>
                <span className="api">{motActuel.api}</span>
              </div>
              <button
                type="button"
                className="btn--icone btn--discret accueil__mot-audio"
                onClick={() => prononcerSpecimen(motActuel.mot)}
                aria-label={`Prononcer le mot ${motActuel.mot}`}
              >
                🔊
              </button>
            </div>

            <p className="accueil__mot-detail-def">{motActuel.def}</p>

            <div className="accueil__mot-detail-exemple">
              <span className="accueil__exemple-icone" aria-hidden="true">«</span>
              <p>{motActuel.exemple}</p>
            </div>

            <div className="accueil__mot-detail-action">
              <button
                type="button"
                className="btn accueil__btn-explorer-lexique"
                onClick={onOuvrirLexique}
              >
                <span>Consulter la fiche complète dans le lexique</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Florilège Littéraire & Maximes de Maîtres */}
      <section className="carte accueil__florilege" aria-label="Florilège littéraire">
        <div className="accueil__florilege-decor" aria-hidden="true">❦</div>
        <blockquote className="accueil__florilege-texte">
          {citationActuelle.texte}
        </blockquote>
        <div className="accueil__florilege-auteur-ligne">
          <cite className="accueil__florilege-auteur">
            <strong>{citationActuelle.auteur}</strong> — <span>{citationActuelle.oeuvre}</span>
          </cite>
          <p className="accueil__florilege-portee">{citationActuelle.portee}</p>
        </div>

        <div className="accueil__florilege-navigation" role="tablist" aria-label="Choix de la maxime littéraire">
          <button
            type="button"
            className="accueil__florilege-nav-btn"
            onClick={() => setCitationIndex((citationIndex - 1 + CITATIONS_FLORILEGE.length) % CITATIONS_FLORILEGE.length)}
            aria-label="Citation précédente"
          >
            <span aria-hidden="true">←</span>
          </button>

          <div className="accueil__florilege-auteurs-liste">
            {CITATIONS_FLORILEGE.map((c, i) => {
              const estActif = citationIndex === i
              return (
                <button
                  key={c.auteur}
                  type="button"
                  role="tab"
                  aria-selected={estActif}
                  className={`accueil__florilege-auteur-btn ${estActif ? 'accueil__florilege-auteur-btn--actif' : ''}`}
                  onClick={() => setCitationIndex(i)}
                >
                  <span className="accueil__florilege-chiffre" aria-hidden="true">0{i + 1}</span>
                  <span className="accueil__florilege-nom">{c.auteur}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="accueil__florilege-nav-btn"
            onClick={() => setCitationIndex((citationIndex + 1) % CITATIONS_FLORILEGE.length)}
            aria-label="Citation suivante"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      {/* 8. Grande Bannière d'Appel à l'Action Finale */}
      <section className="carte accueil__banniere-cta" aria-label="Passer à l'action">
        <div className="accueil__banniere-halo" aria-hidden="true" />
        <div className="accueil__banniere-decor-gauche" aria-hidden="true">❦</div>
        <div className="accueil__banniere-decor-droite" aria-hidden="true">❦</div>
        <div className="accueil__banniere-contenu">
          <div className="accueil__banniere-pilules-progression" aria-hidden="true">
            <span className="banniere-pilule"><span className="banniere-pilule-icone">🎯</span> 5 mots par jour</span>
            <span className="banniere-pilule-sep">·</span>
            <span className="banniere-pilule"><span className="banniere-pilule-icone">⏱️</span> 3 minutes de rituel</span>
            <span className="banniere-pilule-sep">·</span>
            <span className="banniere-pilule"><span className="banniere-pilule-icone">🧠</span> Ancrage pérenne SM-2</span>
          </div>

          <span className="accueil__kicker accueil__kicker--lumineux">DISCIPLINE DE L'ESPRIT</span>
          <h2 className="accueil__banniere-titre">
            L'éloquence souveraine commence par <span className="accueil__titre-emphase">cinq minutes aujourd'hui</span>.
          </h2>
          <p className="accueil__banniere-chapeau">
            Aucun compte requis, aucune sollicitation commerciale. Faites du mot rare et scrupuleusement choisi
            votre plus fidèle allié lors de vos examens, concours, plaidoiries et écrits quotidiens.
          </p>

          <div className="accueil__banniere-actions">
            <button
              type="button"
              className="btn btn--principal accueil__btn-action accueil__btn-cta-lancer"
              onClick={() => onCommencer(5)}
            >
              <span>Démarrer ma première session</span>
              <span className="accueil__btn-fleche" aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="btn accueil__btn-action accueil__btn-cta-index"
              onClick={onOuvrirLexique}
            >
              <span aria-hidden="true">📚</span>
              <span>Feuilleter les 1 010 termes</span>
            </button>
          </div>

          <div className="accueil__banniere-garanties">
            <span className="accueil__garantie-item"><span className="accueil__garantie-coche" aria-hidden="true">✓</span> 100% Libre & Gratuit</span>
            <span className="accueil__garantie-item"><span className="accueil__garantie-coche" aria-hidden="true">✓</span> Zéro compte requis</span>
            <span className="accueil__garantie-item"><span className="accueil__garantie-coche" aria-hidden="true">✓</span> Données locales sécurisées</span>
            <span className="accueil__garantie-item"><span className="accueil__garantie-coche" aria-hidden="true">✓</span> Fonctionne en mode avion</span>
          </div>
        </div>
      </section>
    </div>
  )
}

