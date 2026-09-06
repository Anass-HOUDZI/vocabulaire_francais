# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Candidats aux concours de l'enseignement, de la haute fonction publique et des grandes écoles préparant des épreuves écrites et orales exigeantes.
- Professionnels de l'écrit (rédacteurs, juristes, communicants, auteurs) cherchant à affiner et varier leur registre lexical.
- Passionnés et curieux de la langue française souhaitant enrichir leur vocabulaire soutenu au quotidien.

## Product Purpose

Fournir un outil d'apprentissage et de mémorisation durable du vocabulaire français soutenu et rare, sans distraction, centré sur la précision du sens, le contexte d'usage et la phonétique exacte.

## Positioning

Une application de révision lexicale experte et sobre :
- Contrairement aux applications grand public gamifiées à outrance (Duolingo), l'accent est mis sur la sobriété, l'érudition et la concentration.
- Contrairement aux outils de flashcards génériques (Anki), le corpus est pré-construit, éditorialisé et validé (1 010 mots riches, 3 syllabes phonétiques cibles, définitions précises, citations contextuelles, alertes sur les mésusages et prononciations API/SAMPA).

## Operating Context

- Sessions de révision courtes et quotidiennes (micro-apprentissage de 3 à 10 minutes) sur mobile ou ordinateur de bureau.
- Utilisation fréquente en mobilité (transports, temps morts) nécessitant une disponibilité immédiate sans réseau.

## Capabilities and Constraints

- **Strictement autonome et hors-ligne :** Aucune dépendance serveur, aucun compte, aucune télémétrie. Persistance intégrale dans `localStorage` avec fonctions d'import/export JSON.
- **Répétition espacée éprouvée :** Algorithme SM-2 à 4 niveaux d'évaluation.
- **Exercices contextuels variés :** Cloze tests (phrases à trous), identification de définitions, détection de faux-sens / mésusages.
- **Synthèse vocale intégrée :** Web Speech API en `fr-FR` couplée aux notations phonétiques API.
- **Stack technique :** React 19, TypeScript, Vite, PWA (`vite-plugin-pwa`), CSS Vanilla avec tokens sémantiques.

## Brand Commitments

- **Nom :** Lexique — vocabulaire français avancé.
- **Ton :** Érudit, littéraire, rigoureux et bienveillant ; absence de jargon enfantin ou de bannières criardes.
- **Typographie & mise en page :** Clarté éditoriale soignée, inspiration livre / dictionnaire de référence.

## Evidence on Hand

- Corpus éditorialisé de 1 010 mots (`src/data/corpus.ts`) protégé par 19 invariants de tests unitaires (`src/data/corpus.test.ts`).
- Suite de tests complète de 164 tests automatisés (planificateur SRS, manipulation de texte, phonétique, contraste WCAG AA, conformité `axe-core`).

## Product Principles

1. **La langue avant le décor :** Le design doit s'effacer au profit de la lisibilité textuelle, du rythme de lecture et de la mémorisation.
2. **Autonomie et souveraineté absolue :** Les données restent sur l'appareil de l'utilisateur, fonctionnel n'importe où, n'importe quand, même en mode avion.
3. **Rigueur linguistique :** Chaque mot présenté doit comporter sa juste définition, son registre précis, sa prononciation et son piège d'usage courant.
4. **Accessibilité sans compromis :** 100% accessible au clavier, contraste WCAG AA rigoureusement validé, 0 violation `axe-core`.

## Accessibility & Inclusion

- Conformité WCAG 2.1 AA intégrale validée via `axe-core`.
- Parcours complet utilisable au clavier sans souris ni tactile.
- Prise en charge des thèmes clair, sombre et préférence système via variables CSS.
