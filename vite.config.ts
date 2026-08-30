import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Chemins relatifs : l'application doit fonctionner servie depuis un
  // sous-répertoire (GitHub Pages) aussi bien qu'à la racine d'un domaine.
  base: './',
  server: { port: 5174, open: false },
})
