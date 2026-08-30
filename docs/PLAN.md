# Lexique — cadre, décisions, plan jusqu'au MVP

> État au 31/08/2026. Une maquette fonctionnelle est déjà dans le dépôt : 60 fiches,
> quatre formats d'exercice, révision espacée, mode sombre, audio, 63 tests verts.
> Ce document fixe ce qui est décidé, ce qui est coupé, et ce qui reste à faire.

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
| 2 | Planificateur | SM-2 maison, 4 notes, ~150 lignes, testé | FSRS via `ts-fsrs` | FSRS est meilleur, mais 60 mots ne calibrent rien et SM-2 est écrit et couvert par 22 tests. **Contrepartie assumée : `LogRevision` enregistre déjà `etatAvant` et `joursEcoules`, les champs qu'un optimiseur FSRS exigera.** Sans eux la bascule serait impossible rétroactivement. |
| 3 | Persistance | `localStorage`, historique **jamais tronqué** | IndexedDB / Dexie | Quelques centaines de Ko, API synchrone, zéro dépendance. Tronquer l'historique reviendrait à renoncer à la décision 2. Bascule prévue si l'usage dépasse ~10 000 révisions. |
| 4 | État global | `useReducer` + contexte | Zustand, Redux | Un seul objet sérialisable, transitions déclenchées par l'utilisateur seul. Seuil de bascule : écritures concurrentes (synchronisation, onglets multiples). |
| 5 | Navigation | 4 onglets via `location.hash` | React Router | Quatre écrans sans paramètre. Conséquence assumée : pas d'URL partageable vers une fiche. |
| 6 | Audio | Web Speech API, voix `fr-*` | MP3 pré-générés, TTS cloud | Aucune clé, aucune donnée sortante, latence nulle. **L'API phonétique écrite reste la source de vérité** : beaucoup d'Android n'ont aucune voix française, le bouton est alors désactivé avec un libellé explicite. |
| 7 | Notation | QCM et saisie → verdict calculé ; note SRS restreinte selon le résultat | Auto-évaluation libre après chaque exercice | Deux sources de note sur le même item se contredisent. Une réponse fausse ne peut pas être notée « Facile ». |
| 8 | Accents | Tolérés en saisie, **signalés**, mode strict optionnel | Refus strict par défaut | Sur mobile, saisir « é » coûte un appui long : refuser transformerait un exercice de lexique en exercice de clavier. |
| 9 | Distracteurs | Écrits à la main dans le corpus, un jeu par phrase | Génération par embeddings / fréquence | Un leurre écrit pour *cette* phrase bat n'importe quelle heuristique. Le coût est reporté sur la production du corpus, où il est assumé. |
| 10 | Langue de l'interface | Français en dur, aucune couche i18n | `react-i18next` | Décision explicite, à écrire, sinon quelqu'un l'ajoutera « au cas où ». |
| 11 | PWA / offline | **Hors MVP** | `vite-plugin-pwa` au MVP | Reporté au lot L6. Note : le service worker exigera de passer `base` de `'./'` à un chemin absolu — un SW en base relative ne contrôle rien. |
| 12 | Télémétrie | Aucune. Zéro requête réseau à l'exécution | — | Cohérent avec le fonctionnement hors ligne. |

---

## 3. Ce qui est déjà livré

| Domaine | État |
|---|---|
| Corpus | 60 fiches, **toutes trisyllabiques**, 4 champs thématiques, difficulté 1–5, API, syllabation, définition, exemple, synonymes, antonymes, mésusage + correction, étymologie, phrase à trou et ses 3 leurres |
| Révision espacée | SM-2 à 4 notes, paliers d'apprentissage 1 min / 10 min, rechute à 40 % de l'intervalle, plafond 365 j, jour logique basculant à 4 h, file plafonnée, quota de nouveaux/jour |
| Exercices | 4 formats en rotation selon l'état de la carte : phrase à compléter, reconnaissance, rappel actif en saisie libre, discrimination d'usage |
| Liste | Filtres syllabes / difficulté / champ / nature / avancement, recherche plein texte, 4 tris, fiche en modale |
| Progression | Mots acquis, rappel sur 30 j, révisions du jour, série, répartition, charge prévue à 7 jours, mots les plus résistants |
| Accessibilité | Clavier complet (`1`–`4`), `aria-live`, lien d'évitement, aucune information par la couleur seule, `prefers-reduced-motion`, taille de texte réglable, thème clair/sombre/système |
| Données | Export / import JSON, réinitialisation confirmée, bannière si l'écriture échoue, barrière d'erreur racine |
| Qualité | 63 tests (`srs`, `texte`, `stockage`, invariants du corpus), TypeScript strict, build 100 Ko gzip |

Ce qui manque pour appeler cela un MVP : le corpus (§1.4), et les lots L4 à L6.

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

Limite honnête : **Lexique n'a aucun champ de domaine**. Exclure le jargon
(*cotylédon*, *glycémie*) demande une passe supplémentaire — jointure DBnary sur
les catégories thématiques du Wiktionnaire, puis classification binaire
« culture générale vs jargon ».

### 4.3 Vérification adversariale

La procédure qui a produit les 60 fiches actuelles, et qui tient à l'échelle :

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

Le corpus actuel est **rédigé, pas extrait** : définitions, exemples et mésusages
sont originaux, aucune phonétique n'en provient encore. Dès qu'un champ viendra
de Lexique, il faudra un `LICENCE-DONNEES.md` distinct de la licence du code et
un écran « Sources » dans les réglages.

---

## 5. Lots jusqu'au MVP, avec critères d'acceptation

Chaque critère se répond par oui ou par non.

| Lot | Contenu | Critère d'acceptation | Effort |
|---|---|---|---|
| **L0** ✅ | Maquette fonctionnelle : SRS, 4 formats, liste filtrable, progression, thème, audio, export | `npm run build && npm test` passe ; une session complète s'enchaîne sans erreur console | fait |
| **L1** ✅ | Contrat de journal pérenne | Un test échoue si `etatAvant` ou `joursEcoules` disparaît de `LogRevision` | fait |
| **L2** ✅ | Sauvegarde | Exporter → réinitialiser → réimporter rend `cartes` et `logs` strictement égaux à l'original | fait |
| **L3** | Premier lancement | Un profil neuf termine une session sans ouvrir les réglages ; l'écran J0 propose 5 mots ; file vide → message, sans bouton qui entamerait le quota de demain | 0,5 j |
| **L4** | Corpus 300 | `LEXIQUE.length >= 300` ; 0 échec des 19 invariants ; 0 identifiant dupliqué ; `nbSyllabes === 3` sur 100 % des entrées ; 10 % re-vérifiés au CNRTL, taux d'erreur du lot < 5 % | 6–8 j |
| **L5** | Accessibilité | Session complète au clavier seul, sans souris ; axe-core : 0 violation « serious » sur les 4 vues ; contraste AA vérifié en clair et en sombre | 1 j |
| **L6** | PWA | Build servi en HTTPS, mode avion, rechargement à froid : l'application démarre et une note est enregistrée (impose `base` absolue) | 1 j |
| **L7** | Déploiement | URL publique ; application installée sur un Android et un iPhone ; une session complétée sur chacun, audio testé sur les deux | 0,5 j |

**MVP = L0 à L7.** Chemin critique : L4, seul lot qui ne se compresse pas.

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
| **Critique** | 60 mots = 8 jours d'usage, puis l'application est vide | Ne pas sortir sous 300 fiches relues (L4) |
| **Critique** | Perte de progression : `localStorage` est effaçable par le navigateur ou par l'utilisateur en vidant les données du site | Export déjà disponible ; ajouter un rappel après 7 jours sans export ; appeler `navigator.storage.persist()` |
| **Élevé** | Corpus généré = corpus faux. Une définition plausible mais inexacte est pire que pas de fiche du tout | Relecture adversariale + 19 invariants en test + échantillon manuel de 10 % |
| **Élevé** | Abandon par surcharge : 8 nouveaux mots/jour deviennent ~40 révisions quotidiennes en trois semaines | Quota et plafond de session déjà en place ; la courbe de charge à 7 jours est affichée précisément pour rendre cet effet visible avant qu'il ne se produise |
| **Moyen** | Aucune voix `fr-*` sur beaucoup d'Android | Bouton désactivé avec libellé explicite, API phonétique toujours affichée ; à tester sur un appareil réel (L7) |
| **Moyen** | CC BY-SA non honorée si des champs viennent de Lexique | `LICENCE-DONNEES.md` + écran « Sources » avant toute publication |
| **Faible** | Identifiants instables (`eluder` vs `éluder`) | Règle figée : `id = slug ASCII`, jamais recalculé ; vérifiée par test |
| **Faible** | Horloge reculée par l'utilisateur | Les écarts sont bornés par `max(0, …)` ; le planificateur ne lit jamais l'horloge lui-même |
