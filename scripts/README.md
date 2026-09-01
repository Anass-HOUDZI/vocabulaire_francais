# Scripts de production du corpus

Aucun de ces scripts ne touche à la phonétique par génération : elle vient
toujours de [Lexique 3.83](http://www.lexique.org/), téléchargé à part
(`Lexique383.tsv`, non versionné — ~25 Mo). Détail de la méthode dans
`docs/PLAN.md` §4.

## Ordre d'exécution pour agrandir le corpus

1. **Obtenir des candidats.** Soit statistiquement, avec
   `construire-candidats.mjs <Lexique383.tsv> <candidats.json>` (filtre
   fréquence/registre/syllabes) ; soit en faisant proposer des lemmes par des
   agents (plus fiable sur le *registre*, que Lexique ne code pas). Dans les
   deux cas, le format d'entrée attendu par l'étape suivante est :
   `[{ mot, categorie, theme, glose }, …]`.

2. **Vérifier contre Lexique** — obligatoire, quelle que soit l'origine des
   candidats :
   ```
   node scripts/verifier-lemmes-lexique.mjs Lexique383.tsv candidats.json verifiees.json
   ```
   Rejette tout mot absent de Lexique, à 2 ou 4 syllabes réelles, de
   catégorie grammaticale différente, ou homographe ambigu.

3. **Préparer la rédaction** — dérive l'API/la syllabation de la colonne
   `syll` de Lexique (jamais générée) et calcule la difficulté (fréquence
   livres/films) :
   ```
   node scripts/preparer-redaction.mjs verifiees.json selection.json lots.json [taille_lot]
   ```
   `selection.json` porte la phonétique qui alimentera la fusion ; `lots.json`
   est le payload à transmettre aux agents rédacteurs — **sans aucune donnée
   phonétique**, seulement `mot`, `categorie`, `genre`, `glose`.

4. **Rédiger et relire.** Un workflow multi-agents (hors de ce dépôt) génère,
   pour chaque mot de `lots.json`, une fiche complète (definition, exemple,
   synonymes, antonymes, mesusage, correction, etymologie, cloze), puis un
   second passage relit en posture adversariale. Sortie attendue : un tableau
   `entrees` au même format que les objets ci-dessus.

5. **Fusionner** :
   ```
   node scripts/fusionner-corpus.mjs selection.json redaction.json ../src/data/corpus.ts
   ```
   Insère les nouvelles entrées avant les existantes, réinjecte la phonétique
   et la difficulté depuis `selection.json` (jamais celles éventuellement
   renvoyées par l'agent rédacteur), et signale les alertes mécaniques.
   **Beaucoup d'alertes « n'emploie pas le mot » sont de fausses alertes** sur
   des formes conjuguées irrégulières (*requérir* → *a requis*, *étayer* →
   *étaie*/*étaye*) : l'heuristique de contrôle compare un radical à 5
   caractères fixes, trop strict pour ces verbes. Vérifier à la main plutôt
   que d'ignorer systématiquement.

6. **Valider** : `npm test` (dont `src/data/corpus.test.ts`, 19 invariants) et
   `npm run build`.

## `generer-icones.mjs`

Sans rapport avec le corpus : génère les icônes PWA (`public/icons/`) sans
dépendance de dessin, par un encodeur PNG minimal. `npm run icons` pour
régénérer après un changement de charte graphique.
