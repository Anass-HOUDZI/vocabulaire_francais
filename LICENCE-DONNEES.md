# Licence des données du corpus

Le code de l'application est distinct des données qu'il affiche. Cette licence
ne porte que sur le contenu de `src/data/corpus.ts`.

## Champs dérivés de Lexique 3.83

Les champs **`api`**, **`syllabation`** et **`nbSyllabes`** de chaque entrée du
corpus sont dérivés des colonnes `phon`, `syll` et `nbsyll` de la base
[Lexique 3.83](http://www.lexique.org/), par une conversion SAMPA → API
déterministe et testée (`src/lib/phonetique.ts`). Aucune phonétique n'est
générée par un modèle de langue — c'est une règle du projet, vérifiée par
`src/data/corpus.test.ts`.

Lexique 3.83 est distribué sous licence **CC BY-SA 4.0** par ses auteurs :

> New, B., Pallier, C., Brysbaert, M. & Ferrand, L. (2004). Lexique 2 : A new
> French lexical database. *Behavior Research Methods, Instruments, &
> Computers*, 36 (3), 516-524.

Le partage à l'identique (*ShareAlike*) porte sur le jeu de données dérivé —
c'est-à-dire les trois champs phonétiques ci-dessus, redistribuables sous les
mêmes termes — et non sur le code de l'application, sous licence propre.

## Champs rédigés

Tous les autres champs — **`definition`**, **`exemple`**, **`synonymes`**,
**`antonymes`**, **`mesusage`**, **`correction`**, **`etymologie`**, **`cloze`**
— sont des contenus originaux, rédigés puis relus contradictoirement (un
modèle rédige, un second relit en présumant l'existence d'erreurs), jamais
extraits d'un dictionnaire sous droits. Le Trésor de la langue française
(TLFi/CNRTL) et les dictionnaires Le Robert et Larousse n'ont fourni aucune
donnée au corpus : ils restent, le cas échéant, une référence de vérification
manuelle, pas une source de contenu redistribué.

## Attribution dans l'application

Cette attribution est également visible dans l'application, dans l'onglet
Réglages, section « Sources » (`src/components/Reglages.tsx`).
