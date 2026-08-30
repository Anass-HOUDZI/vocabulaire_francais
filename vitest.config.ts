import { defineConfig } from 'vitest/config'

/**
 * Configuration de test séparée de `vite.config.ts`.
 *
 * Les tests ne portent que sur la logique pure (`src/lib`) : ils n'ont besoin ni
 * du plugin React, ni d'un DOM. Garder les deux configurations distinctes évite
 * le conflit de types entre la version de Vite utilisée par l'application et
 * celle que Vitest embarque.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
