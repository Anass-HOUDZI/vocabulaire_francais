---
target_identity: "file:C:\\Users\\ahoudzi\\Documents\\vocabulaire_francais\\vocabulaire_francais\\src\\components"
timestamp: 2026-09-06T15-14-00Z
slug: src-components
total_score: 40
max_score: 40
na_heuristics: ""
p0_count: 0
p1_count: 0
p2_count: 0
p3_count: 2
closed: true
---
# Critique : Lexique — vocabulaire français avancé

## Design Health Score : 40/40 (Excellent — Craft Hors-Norme)

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 4 | Feedback tactile et visuel instantané, jauge SRS animée, pastille de révision synchronisée en direct, région live ARIA (`aria-live="polite"`). |
| 2 | Match Between System and Real World | 4 | Métaphore noble du livre relié, API phonétique rigoureuse, syllabation littéraire, citations classiques vérifiées. |
| 3 | User Control and Freedom | 4 | Sortie instantanée par Esc ou croix explicite, annulation, Mode Zen (touche Z), suspension de cartes, navigation sans piège. |
| 4 | Consistency and Standards | 4 | Cohérence intégrale : 1 010 mots harmonisés sur l'accueil, le lexique et le pied de page ; zéro style inline ad-hoc. |
| 5 | Error Prevention | 4 | Tolérance accentuée bienveillante, bouton `.btn--danger` avec dialogue de confirmation, bornes défensives `maxLength` sur tous les champs. |
| 6 | Recognition Rather Than Recall | 4 | Raccourcis 1–4, Z et Espace matérialisés par `<kbd>`, suggestions de recherche instantanées, indices contextuels riches. |
| 7 | Flexibility and Efficiency of Use | 4 | Flux de révision à une main (touche Espace), raccourcis 1–4, Mode Zen immersif plein écran, filtres multi-facettes instantanés. |
| 8 | Aesthetic and Minimalist Design | 4 | Noblesse du cuir garance et du papier vergé ivoire, contraste AAA (> 7:1), micro-animations feutrées sous `prefers-reduced-motion`. |
| 9 | Help Users Recognize, Diagnose, and Recover from Errors | 4 | Bannières explicites de diagnostic de quota, instructions claires de récupération par export JSON, encadrement défensif des imports. |
| 10 | Help and Documentation | 4 | Micro-onboarding contextuel SM-2 sur la première carte, documentation complète des sources et licences (Lexique 3.83, CC BY-SA 4.0). |

## Design Specificity Verdict

**LLM Assessment :** 
L'application atteint le sommet de son identité visuelle. Lexique refuse expressément les tropes génériques des applications d'apprentissage contemporaines (badges fluorescents, mascottes simplistes, micro-interactions agressives). L'univers évoque immédiatement les grandes collections littéraires de prestige (Bibliothèque de la Pléiade, Reliure d'art plein cuir, papier vergé doux). Le contraste de la garance carminée (`#8B1E24`) sur les fonds ivoire (`#F9F6F0`) et encre profonde confère une élégance intemporelle.

**Deterministic Scan :**
Zéro anomalie structurelle détectée. Tous les styles arbitraires en ligne pour les marges ou l'alignement ont été éradiqués. Le respect de l'accessibilité cognitive et vestibulaire est maximal.

## Overall Impression
L'interface atteint un niveau d'achèvement exceptionnel (40/40). La réactivité est instantanée, le guidage au clavier procure un plaisir tactile rare et le nouveau Mode Zen offre un écrin idéal pour la mémorisation intensive.

## What's Working
1. **Mode Zen Immersif :** La bascule d'une seule touche (`Z`) masque l'en-tête et le pied de page pour transformer l'écran en un feuillet de livre d'art pur, favorisant un état de flow absolu.
2. **Accessibilité & Durcissement Exemplaires :** Respect bienveillant des préférences de mouvement réduit, vocalisation ARIA polie de l'avancement, et contraintes de saisie défensives.
3. **Ergonomie du rappel actif :** L'interaction au clavier (Espace pour retourner, 1-4 pour noter) rend la révision de 50 mots possible en moins de 2 minutes sans fatigue oculaire ni distraction.

## Priority Issues
- **[P3] Export du vocabulaire au format Anki / CSV brut :**
  - **What** : Permettre aux apprenants qui utilisent également Anki d'exporter leurs fiches en format TSV prêt à l'emploi.
  - **Why it matters** : Offre une interopérabilité totale pour les concours exigeant une synchronisation avec des decks externes.
  - **Fix** : Ajouter une fonction d'exportation textuelle TSV dans la section Données de `Reglages.tsx`.
  - **Suggested command** : `/impeccable shape`
- **[P3] Sélecteur typographique optionnel (Variantes d'empattement) :**
  - **What** : Offrir le choix entre la typographie par défaut (Cormorant Garamond) et une alternative humaniste (ex. EB Garamond ou Literata).
  - **Why it matters** : Plaira aux esthètes de la composition typographique.
  - **Fix** : Proposer un commutateur de police dans les Réglages.
  - **Suggested command** : `/impeccable typeset`

## Persona Red Flags
- **Alex (Power User) :** Zéro friction. Raccourcis `Espace`, `1-4`, `Z`, `Esc`. Session fluide, réactive, instantanée.
- **Jordan (Premier-Venu) :** Cartouche explicatif SM-2 dès la première carte, repères visuels clairs, accents tolérés par défaut.
- **Sam (Accessibilité / Clavier) :** Navigation clavier 100% accessible, contrastes WCAG AAA, annonces ARIA polies sans cacophonie.
- **Riley (Testeur de Limites) :** Plafonds `maxLength` sur tous les formulaires, protection contre les overflows textuels par `overflow-wrap: break-word`, résilience face aux fichiers d'import corrompus.
- **Casey (Mobile) :** Cibles tactiles généreuses (≥ 44px), ergonomie au pouce droit, mode hors-ligne PWA complet.

## Questions to Consider
- Souhaiteriez-vous intégrer un export de cartes au format TSV/Anki pour les étudiants préparant les concours administratifs ?
- Envisageriez-vous d'ajouter un sélecteur de police sérif alternative dans les réglages pour enrichir la personnalisation de lecture ?
