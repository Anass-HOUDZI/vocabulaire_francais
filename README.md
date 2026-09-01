# Lexique — vocabulaire français avancé

Application web de mémorisation du lexique français soutenu : mots difficiles
(cible : trois syllabes phonétiques), définition, prononciation, exemple en
contexte, mésusage courant, quiz contextuels et révision espacée.

Tout fonctionne hors ligne, sans backend et sans compte. La progression reste
dans le navigateur.

## Démarrer

```bash
npm install
npm run dev        # redirige vers http://localhost:5174/vocabulaire_fran-ais/
```

| Commande            | Effet                                                        |
| ------------------- | ------------------------------------------------------------- |
| `npm run dev`       | Serveur de développement                                      |
| `npm run build`     | Vérification de types puis build de production (PWA incluse) |
| `npm run preview`   | Sert le build de production                                   |
| `npm test`          | 164 tests : planificateur, texte, phonétique, stockage, invariants du corpus, contraste WCAG, accessibilité (axe-core) |
| `npm run typecheck` | Vérification TypeScript seule                                  |
| `npm run icons`     | Régénère les icônes PWA (`public/icons/`)                      |

## Architecture

```
src/
├── types/index.ts          Modèle du domaine (Mot, Carte, LogRevision, Réglages)
├── data/
│   ├── corpus.ts           DONNÉES SEULES — 333 mots, régénérable via scripts/
│   ├── corpus.test.ts      19 invariants (syllabes, cloze, définitions circulaires…)
│   └── lexique.ts          Index, facettes
├── lib/
│   ├── srs.ts / .test.ts       Planificateur SM-2 à 4 notes — pur, testé
│   ├── texte.ts / .test.ts     Accents, comparaison tolérante, mélange déterministe
│   ├── phonetique.ts / .test.ts  SAMPA (Lexique) → API, jamais générée
│   ├── exercices.ts             Fabrique d'exercices et choix des leurres
│   └── stockage.ts / .test.ts   Persistance localStorage, migrations, import/export
├── hooks/useSynthese.ts    Synthèse vocale fr-FR (Web Speech API)
├── store/AppContext.tsx    État global : useReducer + contexte
├── components/             Accueil, Entete, Reviser, CarteExercice, FicheMot,
│                           Lexique, Progression, Reglages, Garde (erreurs)
├── styles/
│   ├── index.css           Tokens de thème (clair / sombre / système)
│   └── contraste.test.ts   60 vérifications de ratio WCAG AA sur les tokens
└── accessibilite.test.tsx  axe-core (0 violation) + parcours clavier, 12 tests

scripts/                    Pipeline de production du corpus (voir scripts/README.md)
```

### Deux univers de données, une seule clé

Le **lexique** est livré avec l'application, immuable à l'exécution, versionné
dans git. L'**état utilisateur** (cartes, historique, réglages) vit dans
`localStorage`. Le seul lien est `Mot.id`, un slug stable.

Conséquences pratiques :

- ne jamais modifier un `id` publié — la progression associée serait perdue ;
- ajouter des mots est une opération sans risque, purement additive ;
- retirer un mot du corpus laisse une carte orpheline, volontairement conservée
  (`synchroniserAvecLexique` ne supprime rien).

### Pureté du planificateur

`lib/srs.ts` ne lit jamais l'horloge : l'instant est passé en paramètre. C'est ce
qui rend les 22 tests de `srs.test.ts` déterministes et met le planificateur à
l'abri des changements d'heure. Le réducteur de `AppContext` respecte la même
règle : `Date.now()` est appelé dans l'action, jamais dans la transition.

## Choix techniques et seuils de bascule

| Choix                                | Pourquoi maintenant                                                     | Quand en changer                                                       |
| ------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| SM-2 maison plutôt que FSRS          | ~120 lignes lisibles, aucun démarrage à froid, zéro dépendance           | Dès qu'on dispose de quelques milliers de `LogRevision` à exploiter     |
| `localStorage` plutôt qu'IndexedDB   | État sérialisable de quelques centaines de Ko, API synchrone             | Historique pluriannuel, médias audio, ou plusieurs profils              |
| `useReducer` plutôt qu'un store tiers | Un seul objet d'état, transitions déclenchées par l'utilisateur seul      | Écritures concurrentes : synchronisation serveur, onglets multiples     |
| Web Speech API plutôt qu'un TTS cloud | Aucune clé, aucun envoi de données, latence nulle                        | Si la couverture des voix françaises s'avère insuffisante à l'usage     |
| Onglets par `location.hash`          | Quatre écrans sans paramètre, pas de routeur à installer                  | Dès qu'une URL doit désigner un mot précis (partage, favori)            |
| PWA (`vite-plugin-pwa`), `base` absolue | Installable et utilisable hors ligne ; un service worker en base relative (`'./'`) ne contrôle rien de fiable | Aucun — décision stable une fois l'hébergement fixé |

## Accessibilité

- Navigation clavier complète en session : `1`–`4` pour répondre puis pour noter.
- Aucune information portée par la couleur seule : chaque état juste/faux
  s'accompagne d'un pictogramme et d'un libellé.
- `aria-live` sur les verdicts, lien d'évitement, `prefers-reduced-motion`.
- Thème clair / sombre / système, taille de texte réglable.
- Accents tolérés en saisie libre, mais l'écart est signalé (réglage strict
  disponible).

## Corpus

333 fiches, toutes **trisyllabiques au sens phonétique** — le « e » caduc final ne
compte pas et les semi-voyelles /j/, /w/, /ɥ/ ne forment pas de syllabe :
*atavique* /a.ta.vik/ vaut 3, mais *spécieux* /spe.sjø/ n'en vaut que 2.
`src/data/corpus.test.ts` vérifie 19 invariants à chaque `npm test`.

Les champs `api`, `syllabation` et `nbSyllabes` sont dérivés de
[Lexique 3.83](http://www.lexique.org/) (CC BY-SA 4.0) — **jamais générés** ;
`src/lib/phonetique.ts` fait la conversion SAMPA → API, testée symbole par
symbole. Définitions, exemples, synonymes, mésusages et exercices restent des
contenus originaux, rédigés puis relus contradictoirement. Détail des
licences et attribution complète dans [`LICENCE-DONNEES.md`](LICENCE-DONNEES.md)
et dans l'onglet Réglages → Sources de l'application. Pipeline de production
documenté dans [`scripts/README.md`](scripts/README.md).

## PWA et déploiement

Application installable, fonctionnant hors ligne (`vite-plugin-pwa`, icônes
générées sans dépendance de dessin par `npm run icons`). Cible de déploiement :
GitHub Pages, site de projet — d'où `base: '/vocabulaire_fran-ais/'` dans
`vite.config.ts`. Le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
construit et publie `dist/` sur chaque poussée vers `main`.

**Réglage manuel requis une seule fois**, qu'aucune commande ne peut faire à
la place d'un administrateur du dépôt : *Settings → Pages → Build and
deployment → Source = « GitHub Actions »*.

## Plan de développement

- [`docs/PLAN.md`](docs/PLAN.md) — cadre, décisions figées, lots jusqu'au MVP avec
  critères d'acceptation, pipeline de production du corpus, risques.
- [`docs/plan.html`](docs/plan.html) — même contenu, mise en page lisible ;
  s'ouvre directement dans un navigateur.
