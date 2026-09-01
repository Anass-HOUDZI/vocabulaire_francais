import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Base absolue, pas relative.
 *
 * Décision 11 de docs/PLAN.md : un service worker servi depuis une base
 * relative (`'./'`) ne contrôle rien de fiable — son `scope` dépend de l'URL
 * de la page qui l'enregistre, ce qui casse dès qu'on navigue plus profond
 * qu'un niveau. Le déploiement cible est GitHub Pages en site de projet, donc
 * servi sous `/vocabulaire_fran-ais/` (nom du dépôt) et non à la racine du
 * domaine — d'où cette base, plutôt que `/`.
 */
const BASE = '/vocabulaire_fran-ais/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        id: BASE,
        name: 'Lexique — vocabulaire français avancé',
        short_name: 'Lexique',
        description: "Mémoriser le vocabulaire français soutenu par répétition espacée.",
        lang: 'fr',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        // Couleurs alignées sur --fond / --accent (thème clair) de index.css :
        // au-delà de ces deux points de contact avec le système, le reste du
        // thème est piloté par la page elle-même.
        background_color: '#faf7f2',
        theme_color: '#8a3d2e',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Application 100 % statique, sans API : un précache de tout le build
        // suffit, sans stratégie réseau à arbitrer (pas de contenu qui change
        // sans une nouvelle version de l'app).
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // Toute route inconnue retombe sur la coquille : nécessaire pour une
        // SPA dont les « pages » ne sont que des ancres (#lexique, #reglages).
        navigateFallback: `${BASE}index.html`,
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5174, open: false },
})
