# Lexique — cadre, décisions, plan jusqu'au MVP

> État au 01/09/2026. Le MVP est fonctionnellement complet dans le dépôt : 333 fiches
> (le seuil de 300 est franchi), quatre formats d'exercice, révision espacée, mode
> sombre, audio, PWA installable, 164 tests verts dont accessibilité et contraste.
> Ce document fixe ce qui est décidé, ce qui est coupé, et ce qui reste à faire —
> il ne reste plus qu'une bascule manuelle (GitHub Pages) et une validation sur
> deux appareils physiques.

---

## 1. Cadre — confirmé, avec cinq ajustements

Le cadre est bon. Cinq points méritent d'être redressés avant d'aller plus loin,
parce qu'ils changent le produit, pas seulement son implémentation.

### 1.1 « Trois syllabes » doit être défini phonétiquement, sinon le filtre est faux

C'est l'ajustement le plus important. En français, la syllabe se compte à l'oral,
et deux règles font mentir l'orthographe :

- le **e caduc** final ne se prononce pas — *atavique* = /a.ta.vik/ = **3** ;
- les **semi-voyelles** /j/, /w/, /ɥ/ ne forment pas de syllabe — *spécieux* =
  /spe.sjø/ = **2**, *obvier* = /ɔb.vje/ = **2**, alors que les deux « ont l'air »
  trisyllabiques.

Sans cette règle écrite, un filtre « 3 syllabes » laisse passer la moitié de mots
dissyllabiques et rejette des trisyllabiques légitimes. Elle est appliquée dans le
corpus livré (les 60 entrées sont trisyllabiques au sens phonétique) et vérifiée
par `corpus.test.ts`.

### 1.2 Le rappel actif est l'exercice central, pas le QCM

Reconnaître *sycophante* parmi quatre propositions et le produire soi-même à
partir d'une définition sont deux compétences distinctes. La première s'acquiert
en trois passages et donne une impression de maîtrise qui ne survit pas à
l'usage réel. L'objectif visé — « améliorer sa maîtrise du français intellectuel »
— est un objectif de **production**, pas de reconnaissance.

Conséquence : le QCM sert d'échauffement pendant l'apprentissage, puis cède la
place à la saisie libre dès le passage en révision. C'est ce qu'implémente
`choisirFormat()`.

### 1.3 Le mésusage est le cœur pédagogique, pas un bonus

Pour un locuteur natif cultivé, le problème n'est presque jamais d'ignorer un
mot : c'est de l'employer légèrement de travers. *Laconique* pour un silence,
*acuité* pour la vivacité, *fustiger contre*, *éluder* pour *élucider*,
*versatile* au sens anglais. Ces erreurs sont invisibles à celui qui les commet
et coûtent cher à l'écrit.

Le champ `mesusage` a donc été traité comme obligatoire dans chaque fiche, et un
format d'exercice entier lui est consacré (« discrimination d'usage » : deux
phrases, une correcte, une fautive). C'est un renforcement du point 3 de la
demande, pas un ajout hors-sujet.

### 1.4 Soixante mots ne font pas un MVP livrable

Le corpus produit et relu compte 60 entrées. Un utilisateur assidu à 8 nouveaux
mots par jour l'épuise en **huit jours**. Le seuil de sortie proposé est de
**300 fiches relues** ; la note §4 donne le pipeline pour y arriver sans écrire
300 fiches à la main.

C'est la seule partie du périmètre qui n'est pas atteignable en quelques jours.

### 1.5 « Déverbaliser » : reformulation

Le terme désigne en traduction l'étape où l'on détache le sens de sa formulation
d'origine. Appliqué ici, l'objectif opérationnel est : **casser la reconnaissance
passive et forcer la production active** — d'où le rappel définition → mot, la
reformulation d'une périphrase plate par le mot juste (v1), et le refus d'un
parcours qui se résumerait à relire des fiches.

Si l'intention était différente, c'est le seul point du cadre qui demande un
retour.

---

## 2. Décisions techniques figées

| # | Décision | Retenu | Rejeté | Raison |
|---|---|---|---|---|
| 1 | Stack | React 19 + TypeScript + Vite | SvelteKit, Next.js, Astro | Aucun besoin de SSR ni de routes ; l'écosystème et la familiarité l'emportent. Next.js apporterait un serveur pour une app sans backend. |
| 2 | Planificateur | SM-2 maison, 4 notes, ~150 lignes, testé | FSRS via `ts-fsrs` | FSRS est meilleur, mais sans historique de révisions journalisées il n'a rien à calibrer — le nombre de mots du corpus n'y change rien, c'est le nombre de révisions *effectuées* qui compte. SM-2 est écrit et couvert par 22 tests. **Contrepartie assumée : `LogRevision` enregistre déjà `etatAvant` et `joursEcoules`, les champs qu'un optimiseur FSRS exigera.** Sans eux la bascule serait impossible rétroactivement. |
| 3 | Persistance | `localStorage`, historique **jamais tronqué** | IndexedDB / Dexie | Quelques centaines de Ko, API synchrone, zéro dépendance. Tronquer l'historique reviendrait à renoncer à la décision 2. Bascule prévue si l'usage dépasse ~10 000 révisions. |
| 4 | État global | `useReducer` + contexte | Zustand, Redux | Un seul objet sérialisable, transitions déclenchées par l'utilisateur seul. Seuil de bascule : écritures concurrentes (synchronisation, onglets multiples). |
| 5 | Navigation | 4 onglets via `location.hash` | React Router | Quatre écrans sans paramètre. Conséquence assumée : pas d'URL partageable vers une fiche. |
| 6 | Audio | Web Speech API, voix `fr-*` | MP3 pré-générés, TTS cloud | Aucune clé, aucune donnée sortante, latence nulle. **L'API phonétique écrite reste la source de vérité** : beaucoup d'Android n'ont aucune voix française, le bouton est alors désactivé avec un libellé explicite. |
| 7 | Notation | QCM et saisie → verdict calculé ; note SRS restreinte selon le résultat | Auto-évaluation libre après chaque exercice | Deux sources de note sur le même item se contredisent. Une réponse fausse ne peut pas être notée « Facile ». |
| 8 | Accents | Tolérés en saisie, **signalés**, mode strict optionnel | Refus strict par défaut | Sur mobile, saisir « é » coûte un appui long : refuser transformerait un exercice de lexique en exercice de clavier. |
| 9 | Distracteurs | Écrits à la main dans le corpus, un jeu par phrase | Génération par embeddings / fréquence | Un leurre écrit pour *cette* phrase bat n'importe quelle heuristique. Le coût est reporté sur la production du corpus, où il est assumé. |
| 10 | Langue de l'interface | Français en dur, aucune couche i18n | `react-i18next` | Décision explicite, à écrire, sinon quelqu'un l'ajoutera « au cas où ». |
| 11 | PWA / offline | ✅ `vite-plugin-pwa`, fait au lot L6 | Report à la v2 | `base` passé de `'./'` à `'/vocabulaire_fran-ais/'` (absolu) : un SW en base relative ne contrôle rien. Icônes générées sans dépendance de dessin (`scripts/generer-icones.mjs`, encodeur PNG minimal). |
| 12 | Télémétrie | Aucune. Zéro requête réseau à l'exécution | — | Cohérent avec le fonctionnement hors ligne. |

---

## 3. Ce qui est déjà livré

| Domaine | État |
|---|---|
| Corpus | **333 fiches**, toutes trisyllabiques, 4 champs thématiques, difficulté 1–5 calculée depuis les fréquences Lexique, API/syllabation dérivées de Lexique (jamais générées), définition, exemple, synonymes, antonymes, mésusage + correction, étymologie, phrase à trou et ses 3 leurres |
| Révision espacée | SM-2 à 4 notes, paliers d'apprentissage 1 min / 10 min, rechute à 40 % de l'intervalle, plafond 365 j, jour logique basculant à 4 h, file plafonnée, quota de nouveaux/jour |
| Exercices | 4 formats en rotation selon l'état de la carte : phrase à compléter, reconnaissance, rappel actif en saisie libre, discrimination d'usage |
| Premier lancement | Écran d'accueil dédié (5 mots), file vide affichant l'échéance réelle plutôt qu'un message générique |
| Liste | Filtres syllabes / difficulté / champ / nature / avancement, recherche plein texte, 4 tris, fiche en modale |
| Progression | Mots acquis, rappel sur 30 j, révisions du jour, série, répartition, charge prévue à 7 jours, mots les plus résistants |
| Accessibilité | Clavier complet (`1`–`4`), `aria-live`, lien d'évitement, aucune information par la couleur seule, `prefers-reduced-motion`, taille de texte réglable, thème clair/sombre/système ; **0 violation axe-core « serious »/« critical »**, contraste AA vérifié par calcul (60 tests) |
| PWA | Installable, fonctionne hors ligne, icônes générées sans dépendance, `base` absolue pour un service worker qui contrôle réellement son scope |
| Données | Export / import JSON, réinitialisation confirmée, bannière si l'écriture échoue, barrière d'erreur racine |
| Licences | `LICENCE-DONNEES.md` + écran Réglages → Sources : attribution Lexique 3.83 (CC BY-SA 4.0) pour la phonétique, contenu rédactionnel original par ailleurs |
| Qualité | **164 tests** (`srs`, `texte`, `phonetique`, `stockage`, invariants du corpus, contraste WCAG, accessibilité), TypeScript strict, build ~186 Ko gzip |

Ce qui manque pour appeler cela un MVP déployé : la bascule GitHub Pages (L7,
manuelle) et la validation sur un Android et un iPhone physiques.

---

## 4. Produire le corpus : de 60 à 300 fiches

Le goulot n'est pas la rédaction, c'est la **vérification**. Trois principes.

### 4.1 La phonétique ne se génère jamais

`api`, `syllabation`, `nbSyllabes`, `categorie` doivent venir de
[Lexique 3.83](http://www.lexique.org/) (colonnes `phon`, `syll`, `nbsyll`,
`cgram`), pas d'un modèle. La syllabation y est déjà validée, séparateur `-`.
Toute API affichée est alors une conversion SAMPA → IPA déterministe, testable
unitairement.

Piège si l'on recalcule soi-même : `/j/`, `/w/`, `/ɥ/` (SAMPA `j`, `w`, `8`) ne
sont jamais des noyaux syllabiques, et le e caduc final (`°`) ne compte pas.

### 4.2 Sélection des candidats

Filtre sur Lexique : `islem == 1`, `cgram ∈ {NOM, ADJ, VER, ADV}`, `nbsyll == 3`,
`freqlemlivres ∈ [0.05, 3.0]` (ni hapax, ni banal), `nblettres >= 7`,
`nbhomogr == 1`.

Score de difficulté reproductible, sur l'échelle Zipf (`log10(fpm) + 3`) :

```
s_freq = clamp((5.0 - zipf_livres) / 2.5)          poids 0.40   rareté
s_book = clamp((zipf_livres - zipf_films) / 1.5)   poids 0.15   écart écrit/oral = registre soutenu
s_len  = clamp((nblettres - 6) / 6)                poids 0.15
s_syl  = clamp((nbsyll - 2) / 2)                   poids 0.10
s_opac = 1.0 si nbmorph <= 1 sinon 0.4             poids 0.10   opacité morphologique
s_kn   = 1 - deflem (si defobs >= 20)              poids 0.10   connaissance déclarée
```

Seuils : `<1.8` → 1, `1.8–2.4` → 2, `2.4–3.1` → 3, `3.1–3.8` → 4, `≥3.8` → 5.
Cible : difficulté 3 à 5.

**Correction appliquée après essai (`scripts/construire-candidats.mjs`).** Cette
première pondération place en tête des mots simplement *rares*, pas *soutenus* :
sur un run réel, le haut du classement était occupé par « cancoillotte »,
« badigoinces », « tartignolle » — régionalismes et familiarismes, aucunement
du registre intellectuel visé. Le poids de l'écart écrit/oral (`s_book`, seul
signal de *registre* que porte Lexique) est monté de 0.15 à **0.30**, et celui
de la longueur (`s_len`, un mauvais indice qui favorisait les mots familiers
longs) redescendu à 0.05 :

```
s_freq × 0.35   s_book × 0.30   s_len × 0.05   s_syl × 0.10   s_opac × 0.10   s_kn × 0.10
```

Un filtre dur s'y ajoute : `ecartRegistre = zipf_livres - zipf_films >= 0.45`,
faute de quoi la moitié du haut de liste reste familière malgré la repondération.
`scripts/preparer-redaction.mjs` (utilisé pour les 273 mots proposés par agents
plutôt qu'issus du filtre statistique, cf. §4.5) reprend cette formule corrigée
sans le filtre dur — les mots y sont déjà choisis pour leur registre par
l'agent, Lexique ne fait que trancher la phonétique et estimer la difficulté.

Limite honnête : **Lexique n'a aucun champ de domaine**. Exclure le jargon
(*cotylédon*, *glycémie*) demande une passe supplémentaire — jointure DBnary sur
les catégories thématiques du Wiktionnaire, puis classification binaire
« culture générale vs jargon ».

### 4.3 Vérification adversariale

La procédure qui a produit les 333 fiches actuelles (60 initiales + 273 par le
pipeline décrit ici), et qui tient à l'échelle :

1. génération par lots thématiques de 15 ;
2. **relecture par un second modèle, en posture adversariale** — présumer que
   chaque entrée est fausse, corriger l'API, recompter les syllabes, vérifier que
   la définition n'emploie pas le mot, que la construction de l'exemple est juste,
   qu'aucun distracteur ne conviendrait en fait ;
3. contrôles mécaniques en test (`corpus.test.ts`, 19 invariants) ;
4. échantillon de 10 % re-vérifié à la main au CNRTL.

Rendement observé sur le premier lot : 60 générées → 58 retenues, 36 corrections
appliquées, dont plusieurs sur le comptage syllabique. Les 19 invariants passent
au premier essai après relecture — ils échouaient avant.

### 4.4 Licences — à trancher avant publication

| Source | Redistribuable | Condition |
|---|---|---|
| Lexique 3.83 | Oui | **CC BY-SA 4.0** — attribution (New, Pallier, Brysbaert & Ferrand, 2004) et partage à l'identique du *jeu de données dérivé*. Le ShareAlike contamine le corpus, pas le code de l'application. |
| Wiktionnaire / DBnary | Oui | CC BY-SA 4.0 / 3.0, attribution + SA |
| Morphalou 3.1 | Oui | LGPL-LR |
| TLFi / CNRTL | **Non** | Consultation gratuite ≠ licence de réutilisation. Usage acceptable : vérification manuelle par un relecteur. |
| Le Robert, Larousse | **Non** | CGU explicites + droit *sui generis* des bases de données (art. L.341-1 CPI). Aucune reprise, même reformulée de près. |

Le corpus est **rédigé pour les champs de sens, extrait pour la phonétique** :
définitions, exemples et mésusages restent originaux ; `api`, `syllabation` et
`nbSyllabes` viennent désormais de Lexique 3.83. L'attribution CC BY-SA vit
dans `LICENCE-DONNEES.md`, distinct de la licence du code, et un résumé est
visible dans l'application (Réglages → Sources).

### 4.5 Résultat effectif du premier passage L4

Exécuté en deux temps, chacun avec relecture adversariale :

1. **Proposition** — 8 agents (4 champs thématiques × 2 profils grammaticaux),
   chacun libre de proposer des lemmes du registre soutenu sans connaître
   Lexique : 480 propositions.
2. **Vérification phonétique** — chaque proposition croisée contre Lexique
   3.83 par script déterministe (`nbsyll === 3`, catégorie grammaticale
   concordante, `nbhomogr === 1`) : 273 validées, 207 écartées (76 introuvables
   dans Lexique, 61 doublons entre agents, 24 à 2 ou 4 syllabes réelles malgré
   un comptage correct côté agent — confirmant la mise en garde du §1.1 : les
   adverbes en *-ment* sont le piège le plus fréquent, le e caduc interne
   comptant chez Lexique et pas dans l'intuition orthographique).
3. **Rédaction** — 10 lots thématiques (~30 mots), sans jamais transmettre la
   phonétique aux agents rédacteurs : ils écrivent sur un mot, jamais sur sa
   prononciation.
4. **Relecture adversariale** — un second modèle par lot, consigne de présumer
   l'erreur. Un lot (35 mots) a épuisé ses 5 tentatives de sortie structurée et
   a dû être rejoué isolément via une reprise de workflow (`resumeFromRunId`) ;
   les 9 autres lots ont été réutilisés depuis le cache.

Résultat : **60 + 273 = 333 fiches**, toutes trisyllabiques au sens
phonétique, phonétique 100 % issue de Lexique. Le seuil de 300 (§1.4) est
dépassé avec une marge de 33 fiches.

---

## 5. Lots jusqu'au MVP, avec critères d'acceptation

Chaque critère se répond par oui ou par non.

| Lot | Contenu | Critère d'acceptation | Statut |
|---|---|---|---|
| **L0** ✅ | Maquette fonctionnelle : SRS, 4 formats, liste filtrable, progression, thème, audio, export | `npm run build && npm test` passe ; une session complète s'enchaîne sans erreur console | fait |
| **L1** ✅ | Contrat de journal pérenne | Un test échoue si `etatAvant` ou `joursEcoules` disparaît de `LogRevision` | fait |
| **L2** ✅ | Sauvegarde | Exporter → réinitialiser → réimporter rend `cartes` et `logs` strictement égaux à l'original | fait |
| **L3** ✅ | Premier lancement | Un profil neuf termine une session sans ouvrir les réglages ; l'écran J0 propose 5 mots ; file vide → message avec échéance affichée, sans bouton qui entamerait le quota de demain | fait — `Accueil.tsx`, `prochaineEcheance()` |
| **L4** ✅ | Corpus ≥ 300 | `LEXIQUE.length >= 300` ; 0 échec des 19 invariants ; 0 identifiant dupliqué ; `nbSyllabes === 3` sur 100 % des entrées ; phonétique dérivée de Lexique 3.83, jamais générée | fait — 60 + 273 candidats extraits de Lexique et vérifiés, rédigés puis relus contradictoirement ; voir §4.5 |
| **L5** ✅ | Accessibilité | Session complète au clavier seul, sans souris ; axe-core : 0 violation « serious »/« critical » sur les 4 vues ; contraste AA vérifié en clair et en sombre | fait — `src/accessibilite.test.tsx` (12 tests), `src/styles/contraste.test.ts` (60 tests, a corrigé `--texte-3` et `--bordure-forte`, sous le seuil AA dans les deux thèmes) |
| **L6** ✅ | PWA | Build servi en HTTPS, mode avion, rechargement à froid : l'application démarre et une note est enregistrée (impose `base` absolue) | fait — `vite-plugin-pwa`, icônes générées sans dépendance (`scripts/generer-icones.mjs`), `base: '/vocabulaire_fran-ais/'` ; manifeste, SW et icônes vérifiés en HTTP réel (§7). Reste à valider : mode avion sur appareil physique |
| **L7** | Déploiement | URL publique ; application installée sur un Android et un iPhone ; une session complétée sur chacun, audio testé sur les deux | outillage prêt (`.github/workflows/deploy.yml`) — **une bascule manuelle reste nécessaire : Settings → Pages → Source = « GitHub Actions »**, aucun outil en ligne de commande ne peut le faire à la place d'un administrateur du dépôt |

**MVP = L0 à L7.** L4 était le chemin critique ; il est franchi. Il ne reste que la bascule Pages (L7) et la validation sur deux appareils physiques.

### Après le MVP

| Priorité | Sujet | Déclencheur |
|---|---|---|
| 1 | Bascule FSRS + optimisation locale des poids | ≥ 800 révisions journalisées |
| 2 | Exercice de reformulation (remplacer une périphrase plate par le mot juste) | corpus ≥ 500 |
| 3 | Collocations (quel verbe s'associe au mot) | demande un champ supplémentaire par fiche |
| 4 | Corpus 1 500–2 500 lemmes, thèmes supplémentaires | usage régulier constaté |
| 5 | Synchronisation multi-appareils | uniquement si le besoin apparaît — impose un backend et fait tomber la décision 4 |

### Explicitement hors périmètre

Optimiseur FSRS en WebAssembly · écran de calibrage prédit/observé · génération
automatique de distracteurs · multi-decks et sélecteur de deck · MP3
pré-enregistrés · dictée et production écrite longue · correction par LLM ·
comptes utilisateurs · classement, gamification, notifications push.

---

## 6. Risques

| Gravité | Risque | Mitigation |
|---|---|---|
| **Résolu** | 60 mots = 8 jours d'usage, puis l'application est vide | Corpus étendu à 300+ fiches relues (L4) |
| **Critique** | Perte de progression : `localStorage` est effaçable par le navigateur ou par l'utilisateur en vidant les données du site | Export déjà disponible ; ajouter un rappel après 7 jours sans export ; appeler `navigator.storage.persist()` — reste à faire |
| **Résolu** | Corpus généré = corpus faux. Une définition plausible mais inexacte est pire que pas de fiche du tout | Relecture adversariale sur les 273 fiches ajoutées (rédaction → relecture qui présume l'erreur) + 19 invariants en test. Reste ouvert : l'échantillon manuel de 10 % au CNRTL n'a pas été fait — à faire avant toute publication élargie |
| **Élevé** | Abandon par surcharge : 8 nouveaux mots/jour deviennent ~40 révisions quotidiennes en trois semaines | Quota et plafond de session déjà en place ; la courbe de charge à 7 jours est affichée précisément pour rendre cet effet visible avant qu'il ne se produise |
| **Moyen** | Aucune voix `fr-*` sur beaucoup d'Android | Bouton désactivé avec libellé explicite, API phonétique toujours affichée ; à tester sur un appareil réel (L7) |
| **Résolu** | CC BY-SA non honorée : les champs phonétiques viennent bien de Lexique 3.83 depuis L4 | `LICENCE-DONNEES.md` + écran « Sources » dans Réglages, tous deux en place avant la publication |
| **Faible** | Identifiants instables (`eluder` vs `éluder`) | Règle figée : `id = slug ASCII`, jamais recalculé ; vérifiée par test |
| **Faible** | Horloge reculée par l'utilisateur | Les écarts sont bornés par `max(0, …)` ; le planificateur ne lit jamais l'horloge lui-même |
