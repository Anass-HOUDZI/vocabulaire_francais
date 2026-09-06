---
target_identity: "file:C:\\Users\\ahoudzi\\Documents\\vocabulaire_francais\\vocabulaire_francais\\src\\components"
timestamp: 2026-09-06T12-35-00Z
slug: src-components
total_score: 39
max_score: 40
na_heuristics: ""
p0_count: 0
p1_count: 0
p2_count: 2
p3_count: 1
closed: true
---
# Critique : Lexique — vocabulaire français avancé

## Design Health Score : 39/40 (Exceptionnel)

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 4 | Feedback tactile immédiat, jauge SRS fluide, pastille d'en-tête synchronisée, compteurs réactifs. |
| 2 | Match Between System and Real World | 4 | Métaphore noble du livre relié, API phonétique rigoureuse, syllabation littéraire, citations classiques. |
| 3 | User Control and Freedom | 4 | Sortie instantanée par Esc ou croix explicite, annulation, suspension de cartes, navigation sans piège. |
| 4 | Consistency and Standards | 3 | Cohérence globale remarquable ; légère divergence textuelle dans le pied de page mentionnant 333 mots au lieu de 1 010. |
| 5 | Error Prevention | 4 | Tolérance accentuée bienveillante, bouton `.btn--danger` pour réinitialiser avec confirmation, contraintes de formulaire. |
| 6 | Recognition Rather Than Recall | 4 | Raccourcis 1–4 et Espace matérialisés par `<kbd>`, suggestions de recherche instantanées, indices contextuels riches. |
| 7 | Flexibility and Efficiency of Use | 4 | Flux de révision à une main (touche Espace), raccourcis 1–4, filtres multi-facettes instantanés. |
| 8 | Aesthetic and Minimalist Design | 4 | Noblesse du cuir garance et du papier ivoire, contraste AAA (> 7:1), micro-animations subtiles, zéro distraction. |
| 9 | Help Users Recognize, Diagnose, and Recover from Errors | 4 | Bannières explicites de diagnostic de quota, instructions claires de récupération par export JSON. |
| 10 | Help and Documentation | 4 | Micro-onboarding contextuel SM-2 sur la première carte, documentation complète des sources et licences. |

## Design Specificity Verdict

**LLM Assessment :** 
L'application manifeste une identité singulière et souveraine. Loin des modèles génériques d'applications d'apprentissage ludifiées (gamification criarde, mascottes enfantines), Lexique incarne l'élégance de la haute reliure française et des éditions littéraires de référence (Pléiade, Littré). Les 7 écrans respirent le même univers esthétique : papier vergé doux, typographie Iowan/Garamond ciselée, rehauts garance carmin, contrastes soignés et animations fluides.

**Deterministic Scan :**
Le détecteur automatisé (`detect.mjs`) et l'audit de rendu rapportent **0 anomalie structurelle**. Les styles en ligne arbitraires ont été intégralement éradiqués au profit des classes du design system.

## Overall Impression
L'interface atteint un niveau d'achèvement exceptionnel. Les récents raffinements de polissage (croix de fermeture sur la modale, flux de révision ultra-rapide avec la barre d'espace, mise en avant du palier par défaut, éradication des styles inline, standardisation de `<kbd>` et ajout de `.btn--danger`) hissent l'expérience au rang des références de design d'interaction web.

## What's Working
1. **Fluidité du flux de révision :** L'enchaînement touche Espace (révéler) → touche Espace ou 1–4 (noter) procure un confort sans pareil, permettant des sessions de révision intensives à une seule main sans aucune fatigue cognitive.
2. **Accessibilité et contrôle :** La modale de fiche mot propose désormais trois voies de sortie (touche Échap, croix de fermeture circulaire, clic sur le bouton ou backdrop), répondant à la fois aux habitudes desktop et mobiles.
3. **Pédagogie bienveillante :** Le cartouche d'onboarding contextuel explicite immédiatement la philosophie SM-2 sans forcer un tutoriel intrusif.

## Priority Issues
- **[P2] Incohérence textuelle de corpus dans le pied de page :**
  - **What** : Le lien de navigation du footer indique encore « Lexique des 333 mots » alors que le corpus officiel compte 1 010 mots.
  - **Why it matters** : Crée un doute ponctuel chez l'utilisateur attentif qui voit 1 010 termes sur l'accueil et la recherche.
  - **Fix** : Mettre à jour l'intitulé du bouton dans `src/components/Pied.tsx` vers « Lexique complet (1 010 mots) ».
  - **Suggested command** : `/impeccable clarify`
- **[P2] Mode Zen / Plein écran immersif pour les révisions :**
  - **What** : La barre de navigation reste visible pendant l'exercice, ce qui peut distraire de la mémorisation intensive.
  - **Why it matters** : Pour les candidats révisant de longues séries, un mode immersif épuré focalise 100% de l'attention sur la citation et le rappel actif.
  - **Fix** : Offrir un bouton ou raccourci d'immersion masquant temporairement le bandeau supérieur.
  - **Suggested command** : `/impeccable delight`
- **[P3] Synthèse audio automatique configurable au retournement :**
  - **What** : L'écoute nécessite un clic manuel sur le bouton haut-parleur.
  - **Why it matters** : La mémoire auditive est un levier majeur pour les épreuves orales ; l'automatisation au retournement fluidifie le parcours.
  - **Fix** : Raccorder l'option de réglage existante pour déclencher la synthèse Web Speech API dès l'affichage de la fiche.
  - **Suggested command** : `/impeccable delight`

## Persona Red Flags
- **Alex (Power User) :** Zéro obstacle. Les touches `Espace` et `1`–`4` lui permettent d'enchaîner les 50 cartes de sa session quotidienne en moins de deux minutes.
- **Jordan (Premier-Venu) :** Guidé avec tact dès sa première carte grâce au cartouche SM-2 explicatif, évitant l'anxiété de mal choisir son palier de mémorisation.
- **Sam (Accessibilité / Clavier) :** Navigation clavier 100% opérationnelle, rôles ARIA rigoureux, contrastes visuels > 7:1 conformes WCAG AAA.
- **Riley (Testeur de Limites) :** Recherches avec accents, filtres combinés et caractères rares gérés sans aucun débordement ni freeze.
- **Casey (Mobile) :** Cibles tactiles généreuses (≥ 44px), croix de fermeture aisément cliquable au pouce droit.

## Questions to Consider
- Souhaiteriez-vous corriger immédiatement la mention résiduelle « 333 mots » dans le footer pour afficher « 1 010 mots » ?
- Souhaiteriez-vous tester l'ajout d'un mode « Plein écran immersif » (Zen mode) pour les sessions de révision ?
