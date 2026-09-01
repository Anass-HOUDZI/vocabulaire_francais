import { defineConfig } from 'vitest/config'

/**
 * Configuration de test séparée de `vite.config.ts`.
 *
 * Garder les deux configurations distinctes évite le conflit de types entre la
 * version de Vite utilisée par l'application et celle que Vitest embarque.
 *
 * L'environnement par défaut reste `node` : la logique pure (planificateur,
 * texte, phonétique, corpus, contraste) n'a pas besoin de DOM et tourne en
 * quelques millisecondes. Le seul fichier qui exige un DOM le déclare lui-même
 * par un en-tête `@vitest-environment jsdom`, pour ne pas ralentir le reste.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
