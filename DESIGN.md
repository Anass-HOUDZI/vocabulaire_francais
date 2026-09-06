---
name: Lexique — vocabulaire français avancé
description: Édition littéraire et reliure précieuse au service de la maîtrise lexicale
colors:
  primary: "#8a3d2e"
  primary-dark: "#6e2f23"
  primary-soft: "#f5e8e3"
  primary-contrast: "#ffffff"
  neutral-bg: "#faf7f2"
  neutral-bg-subtle: "#f2ece1"
  surface: "#ffffff"
  surface-variant: "#f7f4ee"
  border: "#e4ddd1"
  border-strong: "#766e62"
  text-primary: "#22201d"
  text-secondary: "#57524a"
  text-muted: "#726b60"
  success: "#1f6b45"
  success-soft: "#e4f0e9"
  error: "#a32b25"
  error-soft: "#f9e7e5"
  warning: "#8a6116"
  warning-soft: "#f8eeda"
  info: "#2b5578"
  info-soft: "#e5edf5"
  dark-bg: "#15141a"
  dark-bg-subtle: "#1c1b22"
  dark-surface: "#201f27"
  dark-surface-variant: "#27262f"
  dark-border: "#33323d"
  dark-border-strong: "#8e8c99"
  dark-text-primary: "#ece9e4"
  dark-text-secondary: "#b4afa7"
  dark-text-muted: "#9a948c"
  dark-accent: "#e08a72"
  dark-accent-fort: "#f0a48d"
  dark-accent-doux: "#35251f"
typography:
  display:
    fontFamily: "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', 'Garamond', Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', 'Garamond', Georgia, serif"
    fontSize: "1.35rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', 'Garamond', Georgia, serif"
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  pill: "999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-contrast}"
    rounded: "{rounded.md}"
    padding: "0.65rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "0.65rem 1.25rem"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.error}"
    rounded: "{rounded.md}"
    padding: "0.65rem 1.25rem"
  button-discrete:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "0.4rem 0.75rem"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  badge:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.pill}"
    padding: "0.15rem 0.55rem"
---

# Design System : Lexique — Édition Littéraire & Reliure Précieuse

## Overview

**Creative North Star : « L'Édition Littéraire & la Reliure Précieuse »**

L'identité visuelle de **Lexique** puise son inspiration dans la tradition séculaire de l'édition d'art française (La Pléiade, Gallimard, l'Imprimerie Nationale) et des dictionnaires historiques de référence (Littré, Robert historique). 

À l'opposé des interfaces criardes ou infantilistes du micro-apprentissage de masse, Lexique célèbre l'érudition, la clarté et le plaisir sensoriel du livre de belle facture. L'environnement visuel installe immédiatement l'apprenant dans une atmosphère de recueillement intellectuel et d'exigence bienveillante.

En mode clair, l'application évoque la douceur tactile d'un **papier vergé ivoire chaud** (`#faf7f2`), l'encre d'imprimerie dense (`#22201d`) et les rehauts de cuir **garance carmin** (`#8a3d2e`). En mode sombre, l'espace se métamorphose en cabinet de lecture nocturne avec des fonds ébène texturés (`#15141a`) et des accents terracotta veloutés (`#e08a72`).

**Key Characteristics:**
- **Élégance éditoriale sobre :** Filets d'encadrement délicats (`1px solid var(--bordure)`), ombres satinées discrètes, refus absolu des bordures 3D plastifiées.
- **Typographie classique & moderne :** Titrages et citations en typographie à empattements patrimoniale (`Iowan Old Style`, `Palatino`, `Garamond`), texte d'interface et exercices en linéale moderne limpide (`ui-sans-serif`).
- **Confort de lecture prolongé :** Contrastes étudiés pour minimiser la fatigue oculaire, dépassant largement les seuils WCAG 2.2 niveau AA.
- **Rigueur d'accessibilité sans compromis :** Toute information portée par une couleur est systématiquement étayée par un texte explicite, un symbole ou une icône sémantique.

---

## Colors

La palette chromatique est organisée en triades rigoureusement contrastées, calibrées pour une harmonie naturelle et une clarté sans effort.

### Primary
- **Cuir Garance** (`#8a3d2e`): Cuir noble de reliure pour les actions maîtresses, les ancres de navigation actives et les vedettes majeures (ratio > 6.5:1 sur papier).
- **Carmin Sombre** (`#6e2f23`): Survol tactile, bordures actives et signatures littéraires.
- **Voile Rosé** (`#f5e8e3`): Fond adouci des pastilles d'état, décomposition syllabique et zones actives.
- **Blanc Immaculé** (`#ffffff`): Texte contrasté sur aplats de cuir garance (ratio 7:1).

### Secondary
- **Bleu de Sèvres** (`#2b5578`): Information lexicale, étymologies, registres de langue et pastilles de niveau. Fond doux associé : `#e5edf5`.
- **Vert Laurier** (`#1f6b45`): Validation de réponse correcte, jauge d'assimilation et maîtrise acquise. Fond doux associé : `#e4f0e9`.

### Tertiary
- **Ocre Doré Ancien** (`#8a6116`): Avertissements bienveillants, nuances d'emploi, soldes de florins et rappels. Fond doux associé : `#f8eeda`.
- **Rouge Vermillon** (`#a32b25`): Erreurs d'évaluation, alertes sur les mésusages et bouton d'action destructive (`.btn--danger`). Fond doux associé : `#f9e7e5`.

### Neutral
- **Papier Vergé Naturel** (`#faf7f2`): Fond de page clair, reposant et chaleureux.
- **Chamois Doux** (`#f2ece1`): Fond secondaire, bandeaux de statistiques et pied de page.
- **Carton Ivoire** (`#ffffff`): Surface des cartes au repos et dialogues.
- **Parchemin Clair** (`#f7f4ee`): Surface variante, survol d'options et cartouches d'exercices.
- **Filet Papier** (`#e4ddd1`): Bordure fine d'encadrement éditorial.
- **Filet d'Encre** (`#766e62`): Bordure forte, séparateurs et ombre de relief des touches `<kbd>`.
- **Encre Noire Chaude** (`#22201d`): Texte principal à très haute lisibilité (ratio 15:1).
- **Gris Sépia** (`#57524a`): Texte secondaire, consignes et définitions contextuelles (ratio > 7.5:1).
- **Bistre Clair** (`#726b60`): Métadonnées, raccourcis et libellés discrets (ratio > 4.5:1).

### Dark Mode (Cabinet Nocturne)
En mode sombre (`data-theme="dark"`), la palette s'adapte sans rupture : fond ébène texturé (`#15141a`), surfaces ardoise (`#201f27` / `#27262f`), filets graphite (`#33323d`), encre craie soyeuse (`#ece9e4`), et accents terracotta chaleureux (`--accent: #e08a72`, `--accent-fort: #f0a48d`, `--accent-doux: #35251f`).

### Named Rules
**The One Voice Rule.** Le cuir garance (`--accent`) est réservé aux intentions majeures (actions clés, ancrage actif, mot vedette). Il ne couvre jamais plus de 10 % de la surface visuelle perçue pour préserver son autorité.

**The Ink Density Rule.** Le texte principal (`--texte`) est composé en encre d'imprimerie chaude (`#22201d`), assurant un contraste supérieur à 15:1 sur papier vergé tout en bannissant le noir brut numérique (`#000000`).

**The Semantic Reinforcement Rule.** Aucune information n'est transmise par la couleur seule : tout succès ou erreur est systématiquement renforcé par un pictogramme explicite (✓, ✕, ℹ) et un libellé textuel.

---

## Typography

Le système typographique combine l'autorité littéraire du caractère à empattements patrimonial avec l'efficacité fonctionnelle de la linéale contemporaine.

**Display Font:** `'Cormorant Garamond', 'EB Garamond', 'Literata', 'Iowan Old Style', Georgia, serif` (with Georgia, serif)
**Body Font:** `'Outfit', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` (with system-ui, sans-serif)
**Label/Mono Font:** `'JetBrains Mono', ui-monospace, 'Cascadia Mono', 'Segoe UI Mono', Menlo, Consolas, monospace` (with monospace)

**Character:** Un dialogue harmonieux entre la noblesse classique du livre relié et la clarté immédiate d'un outil d'étude moderne. Les empattements invitent au recueillement et à la contemplation des mots rares, tandis que la linéale assure un balayage rapide et sans fatigue des exercices.

### Hierarchy
- **Display** (700, clamp(2rem, 5vw, 2.75rem), line-height 1.2): Marque principale Lexique, accroche héroïque d'accueil et vedettes de fiches de vocabulaire.
- **Headline** (700, 1.35rem–1.5rem, line-height 1.3): Titres de grandes sections (`#lexique`, `#reviser`, `#progression`, `#reglages`) et têtes de cartes piliers.
- **Title** (600, 1.15rem–1.25rem, line-height 1.4): En-têtes de modules d'exercices, modales de fiches lexicales et sous-titres d'accueil.
- **Body** (400, 1rem, line-height 1.6, max line length 65–75ch): Définitions complètes, citations en contexte, étymologies et consignes d'exercices.
- **Label** (600, 0.875rem, letter-spacing 0.02em): Boutons d'interaction, onglets de navigation, puces de filtres et métadonnées grammaticales.
- **Mono** (500–700, 0.75rem–0.9rem, line-height 1.25): Transcriptions phonétiques en Alphabet Phonétique International (API `/fɑ̃.faʁ/`), syllabations et touches de raccourcis `<kbd>`.

### Named Rules
**The Literary Serif Rule.** Tout mot vedette, citation d'auteur ou titre majeur s'écrit obligatoirement avec la famille littéraire à empattements (`var(--serif)`). La linéale est strictement réservée aux commandes de manipulation et aux réglages.

**The Monospace Phonetic Rule.** Les transcriptions phonétiques (API) et les touches de raccourcis sont obligatoirement composées en chasse fixe (`var(--mono)`), garantissant l'alignement exact des glyphes phonétiques et le relief visuel des touches.

---

## Layout

L'architecture spatiale repose sur une grille modulaire aérée, inspirée de la mise en page des beaux livres, avec un respect absolu du confort oculaire et des zones d'interaction tactile.

- **Conteneur Maximal :** `62rem` (`~992px`), centré avec marges latérales respirantes de `1.25rem`.
- **Largeur Optimale de Lecture (`.session`) :** Restreinte à `44rem` pour offrir une portée oculaire naturelle (65 à 75 caractères par ligne).
- **Navigation Supérieure :** Bandeau sticky flouté (`backdrop-filter: blur(12px) saturate(160%)`) avec filet inférieur fin `1px solid var(--bordure)`.
- **Points de rupture unifiés :**
  - **Palier Mobile (`<= 640px`) :** Grilles réorganisées en mono-colonne, actions du hero déployées en pleine largeur, masquage des fioritures d'entête non fonctionnelles, et matrice de notation SRS 2×2.
  - **Palier Tablette (`641px – 960px`) :** Grille des 4 piliers en 2×2 colonnes équilibrées, bandeau statistique en matrice 2×2 délestée de filets verticaux.
  - **Palier Bureau (`> 960px`) :** Composition panoramique noble, hero asymétrique `1.08fr 0.92fr` valorisant le spécimen du jour, statistiques à 4 colonnes et rituel quotidien en triptyque.
  - **Palier Micro (`<= 380px`) :** Repli défensif mono-colonne intégral pour téléphones très étroits.
- **Ergonomie Tactile & Safe Areas :** Prise en charge des écrans bord-à-bord (`viewport-fit=cover` et `env(safe-area-inset-*)`). Toutes les commandes interactives respectent la zone tactile minimale de 44 × 44 px.

### Named Rules
**The 44px Touch Floor Rule.** Aucun bouton, onglet, filtre ou élément cliquable ne présente une zone d'interaction inférieure à 44 × 44 px sur appareil mobile ou tactile.

**The Dual Column Mobile Matrix Rule.** La grille d'évaluation SRS passe impérativement d'un écrasement 4 colonnes illisible à une matrice 2×2 confortable sous 640px, empêchant les fausses notes lors du rappel actif.

---

## Elevation & Depth

Le relief visuel s'émancipe de tout artifice plastique pour célébrer la matérialité des feuillets et des reliures d'art :

- **Filets d'encadrement fins :** Bordure fine unifiée `1px solid var(--bordure)` créant des cartouches nets et reposants.
- **Superposition de feuillets :** Les cartes blanches se détachent du fond vergé par leur contraste de surface plutôt que par de lourds halos sombres.
- **Ombrages Mode Sombre :** Densités feutrées sur fonds noirs pour suggérer la superposition sans brillance : `0 1px 2px rgb(0 0 0 / 40%), 0 4px 16px rgb(0 0 0 / 30%)`.

### Shadow Vocabulary
- **Papier Fin** (`box-shadow: 0 1px 2px rgb(34 32 29 / 5%), 0 6px 20px rgb(34 32 29 / 6%)`): Ombre satinée naturelle pour les cartes au repos.
- **Ombre Portée Élevée** (`box-shadow: 0 2px 6px rgb(34 32 29 / 8%), 0 12px 32px rgb(34 32 29 / 10%)`): Utilisée au survol des cartes interactives et pour l'élévation des fenêtres modales (`<dialog>`).
- **Relief Clavier** (`box-shadow: 0 1px 0 var(--bordure-forte)`): Micro-relief d'enfoncement physique pour les touches de raccourci `<kbd>`.

### Named Rules
**The Paper Over Plastic Rule.** Refus catégorique des dégradés néon, des bordures biseautées et des ombres portées agressives. La profondeur est portée par le papier vergé, les filets d'encre et des élévations subtiles.

---

## Shapes

La géométrie de Lexique conjugue la rigueur géométrique des reliures de maroquin avec la douceur des feuillets d'imprimerie :

- **Échelle des Rayons :**
  - **Petit Rayon (`--rayon-sm: 6px`) :** Petits badges, tags de filtres et touches `<kbd>`.
  - **Rayon Standard (`--rayon: 10px`) :** Boutons, options de réponse, champs de recherche et onglets de navigation.
  - **Grand Rayon (`--rayon-lg: 16px`) :** Cartes d'exercice, panneaux de réglages, bannières d'accueil et modales.
  - **Rayon Pilule (`--rayon-pill: 999px`) :** Badges de statut, compteurs numériques et jauges de progression.
- **Contour de Focus Clavier :** Anneau contrasté net `2px solid var(--accent)` avec décalage de `2px` (`outline-offset: 2px`).

### Named Rules
**The Disciplined Radius Rule.** Aucun rayon arbitraire n'est introduit en dehors des 4 échelons officiels (6px, 10px, 16px, 999px).

---

## Components

### Buttons
- **Shape :** Rayon `10px` (`--rayon`).
- **Primary (`.btn--principal`) :** Fond garance noble `var(--accent)`, texte blanc pur `var(--accent-contraste)`, bordure fine `var(--accent-fort)`, rembourrage `0.65rem 1.25rem`. Au survol : assombrissement `var(--accent-fort)` et translation douce `translateY(-1px)`. Au clic physique : enfoncement `translateY(1px)`.
- **Secondary (`.btn`) :** Fond carton ivoire `var(--surface)`, filet papier `1px solid var(--bordure)`, texte encre `var(--texte)`. Au survol : fond parchemin `var(--surface-2)` et filet garance adouci.
- **Danger (`.btn--danger`) :** Action destructrice (réinitialisation). Texte et filet vermillon `var(--erreur)`, fond transparent au repos, fond doux `var(--erreur-doux)` au survol. Repli automatique en pleine largeur sur mobile via `.btn--align-droite`.
- **Discrete (`.btn--discret`) :** Fond transparent, texte discret `var(--texte-2)`, sans bordure au repos.
- **Icon (`.btn--icone`) :** Format compact carré (`min-height: 44px` sur mobile), micro-rotation fluide au survol pour les boutons de lecture audio et de thème.

### Cards / Containers
- **Corner Style :** Rayon large `16px` (`--rayon-lg`).
- **Exercise Card (`.carte`) :** Cartouche sur fond `var(--surface)`, filet d'encadrement `1px solid var(--bordure)`, ombre satinée `var(--ombre)`. Citation centrale sur fond parchemin avec liseré latéral garance.
- **Static Page Card (`.page-contenu-carte`) :** Cartouche centré pour les mentions légales et contacts (`2.5rem 2rem` sur bureau, `1.5rem 1.15rem` sur mobile).
- **Pillar Card (`.accueil__carte-pilier`) :** Cartouche surmonté d'un liseré garance (`::before`), médaillon d'icône en relief et étiquettes techniques en pied. Élévation `translateY(-4px)` au survol.

### Inputs / Fields
- **Search Field (`.recherche__saisie`) :** Fond surface blanche, filet papier `1px solid var(--bordure)`, rayon `10px`, texte encre chaude. Au focus : filet garance net `var(--accent)` et halo doux `color-mix(in srgb, var(--accent) 16%, transparent)`.
- **Textarea (`.contacts__textarea`) :** Redimensionnement vertical uniquement, hauteur minimale confortable de `8rem`.
- **Numeric Fields (`.reglage input[type='number']`) :** Largeur standardisée à `5.2rem`, alignement centré des valeurs.
- **Checkbox Switch (`.reglage input[type='checkbox']`) :** Interrupteur à bascule tactile ergonomique avec bille ivoire contrastée.

### Chips / Badges
- **Keyboard Shortcut (`<kbd>`) :** Typographie monospacée (`var(--mono)`), graisse 700, bordure fine `1px solid var(--bordure)`, ombre de relief physique (`box-shadow: 0 1px 0 var(--bordure-forte)`).
- **Status Badge (`.pastille`) :** Format pilule (`999px`), fond rosé-ivoire `var(--accent-doux)`, texte garance fort `var(--accent-fort)`.
- **Lexical Tag (`.ligne-mot__etiquette`) :** Fond parchemin adouci avec filet discret pour la nature grammaticale et le registre.

### Navigation
- **Header (`.entete`) :** Bandeau sticky flouté, logo textuel littéraire avec point final garance, basculeur de thème nocturne et bouton d'action contextuelle rapide.
- **Tabs (`.nav__lien`) :** Onglets sobres à coins arrondis (`10px`). L'onglet actif se pare d'un fond carmin doux (`--accent-doux`), d'un texte garance fort (`--accent-fort`) et d'une bordure subtile.
- **Footer (`.pied`) :** Grille éditoriale à 4 colonnes sur fond chamois doux (`--fond-2`), avec navigation intégrale, méthodologie linguistique, engagements éthiques (zéro traceur, 100% hors-ligne) et bouton de remontée fluide.

### Signature Component: Carte d'Exercice Littéraire & Dialogue de Fiche Mot
- **Support de Citation Littéraire (`.exercice__support`) :** Citation en grand corps serif avec lettrage soigné, fond légèrement contrasté `var(--surface-2)` et filet latéral garance.
- **Boîte Modale Fiche Mot (`dialog.modale`) :** Fenêtre accessible au clavier avec fond satiné, surtitre grammatical, vedette imposante, décomposition syllabique phonétique (API), bouton de prononciation audio Web Speech API avec micro-impulsion, citation d'auteur, alerte sur les mésusages courants, et croix de fermeture accessible (`.modale__fermer-btn`).
- **Grille de Notation SRS (`.notes`) :** 4 paliers d'évaluation adaptative SM-2 (« À revoir », « Difficile », « Bon », « Parfait ») couplés aux touches `1`–`4` et à la touche `Espace` pour la validation par défaut.
- **Mode Zen Immersif Plein Écran (`.session__btn-zen`, `body.mode-zen`) :** Raccourci `Z` et bouton dédié masquant l'en-tête et le pied de page pour focaliser l'attention sur la révision pure avec fond vergé serein.

---

## Do's and Don'ts

### Do:
- **Do** respecter scrupuleusement la palette canonique : papier vergé (`#faf7f2`), cuir garance (`#8a3d2e`) et encre d'imprimerie chaude (`#22201d`).
- **Do** composer tous les titres, mots vedettes et citations littéraires en typographie à empattements (`var(--serif)`).
- **Do** garantir une zone de contact minimale de 44 × 44 px sur tous les éléments tactiles mobiles.
- **Do** styliser systématiquement les raccourcis clavier avec la balise sémantique `<kbd>` et son micro-relief.
- **Do** employer la classe `.btn--danger` avec confirmation explicite pour toute action de réinitialisation de données.
- **Do** associer systématiquement un pictogramme (✓, ✕, ℹ) et un libellé textuel à toute couleur de retour d'état.
- **Do** maintenir un ratio de contraste supérieur à 4.5:1 pour les textes secondaires et supérieur à 7:1 pour le corps principal.

### Don't:
- **Don't** utiliser de noir pur numérique (`#000000`) sur blanc pur (`#ffffff`) ; toujours privilégier le papier vergé et l'encre chaude adoucie.
- **Don't** introduire de styles en ligne arbitraires (`style={{ ... }}`) en dehors des grandeurs strictement calculées à l'exécution (jauges dynamiques).
- **Don't** employer de bordures 3D biseautées, de surfaces plastifiées ou de bannières distrayantes de gamification infantile.
- **Don't** afficher de couleur de validation (vert ou rouge) sans symbole explicite ni texte d'accompagnement.
- **Don't** compresser les lignes de lecture en dessous de 65 caractères par ligne sur les fiches de mots.
- **Don't** introduire de points de rupture média arbitraires en dehors de l'échelle canonique (380px, 640px, 960px).
