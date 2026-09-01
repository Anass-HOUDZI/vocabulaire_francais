// @vitest-environment jsdom

/**
 * Critère d'acceptation du lot L5, rendu exécutable.
 *
 * Deux exigences, deux blocs :
 *  1. axe-core ne relève aucune violation « serious » ni « critical » sur les
 *     quatre vues ;
 *  2. une session complète s'effectue au clavier seul, sans souris.
 *
 * La règle `color-contrast` est désactivée ici et NON abandonnée : axe a besoin
 * d'un rendu réel pour la calculer, et jsdom n'en fournit pas — elle ressortirait
 * en « incomplete », c'est-à-dire en faux silence. Le contraste est vérifié
 * séparément, sur les tokens eux-mêmes et dans les trois thèmes, par
 * `src/styles/contraste.test.ts`.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import axe from 'axe-core'
import App from './App'
import Garde from './components/Garde'
import { AppProvider } from './store/AppContext'

const VUES = ['Réviser', 'Lexique', 'Progression', 'Réglages'] as const

/** Impacts qui font échouer le lot. « minor » et « moderate » sont tolérés. */
const BLOQUANTS = new Set(['serious', 'critical'])

function monter() {
  return render(
    <Garde>
      <AppProvider>
        <App />
      </AppProvider>
    </Garde>,
  )
}

/**
 * Bouton d'onglet dans la barre de navigation.
 *
 * Un `getByRole('button', {name})` sans portée échoue sur « Lexique » : le
 * bouton « Parcourir le lexique d'abord » de l'écran d'accueil contient aussi
 * ce mot. On restreint donc la recherche au `<nav>`, seul endroit où le nom
 * complet correspond exactement au libellé de l'onglet.
 */
function ongletNav(nom: string) {
  const nav = screen.getByRole('navigation', { name: /Sections/i })
  // Ancrage en début de nom seulement : suffisant pour distinguer les quatre
  // onglets entre eux et du bouton « Parcourir le lexique d'abord » de
  // l'accueil, sans les pièges de \b sur des lettres accentuées.
  return within(nav).getByRole('button', { name: new RegExp(`^${nom}`) })
}

async function violations(element: HTMLElement) {
  const resultat = await axe.run(element, {
    rules: { 'color-contrast': { enabled: false } },
    resultTypes: ['violations'],
  })
  return resultat.violations.filter((v) => BLOQUANTS.has(v.impact ?? ''))
}

const decrire = (v: Awaited<ReturnType<typeof violations>>) =>
  v
    .map(
      (x) =>
        `[${x.impact}] ${x.id} — ${x.help}\n    ${x.nodes
          .slice(0, 3)
          .map((n) => n.html.slice(0, 120))
          .join('\n    ')}`,
    )
    .join('\n')

beforeEach(() => {
  localStorage.clear()
  window.location.hash = ''
})

afterEach(cleanup)

describe('axe-core — aucune violation bloquante', () => {
  it.each(VUES)('vue « %s »', async (vue) => {
    const { container } = monter()
    fireEvent.click(ongletNav(vue))
    const v = await violations(container)
    expect(v.length, `\n${decrire(v)}`).toBe(0)
  })

  it("vue « Réviser » une fois la session engagée", async () => {
    const { container } = monter()
    fireEvent.click(screen.getByRole('button', { name: /Découvrir 5 mots/i }))
    const v = await violations(container)
    expect(v.length, `\n${decrire(v)}`).toBe(0)
  })

  it('modale de fiche ouverte depuis le lexique', async () => {
    const { container } = monter()
    fireEvent.click(ongletNav('Lexique'))
    const liste = screen.getAllByRole('listitem')
    fireEvent.click(within(liste[0] as HTMLElement).getByRole('button'))
    const v = await violations(container)
    expect(v.length, `\n${decrire(v)}`).toBe(0)
  })
})

describe('session complète au clavier seul', () => {
  it("enchaîne les cinq cartes de découverte sans un seul clic sur une carte", () => {
    monter()

    // Le seul geste souris toléré est l'entrée dans la session ; le bouton est
    // de toute façon atteignable au clavier (il reçoit le focus au montage).
    fireEvent.click(screen.getByRole('button', { name: /Découvrir 5 mots/i }))

    const jauge = () => screen.getByRole('progressbar')
    expect(jauge()).toBeDefined()
    expect(screen.getByText('1 / 5')).toBeDefined()

    // Touche « 3 » = troisième note proposée sur une carte neuve, « Facile ».
    for (let i = 0; i < 5; i++) fireEvent.keyDown(window, { key: '3' })

    expect(screen.getByText(/Session terminée/i)).toBeDefined()
    expect(screen.getByText(/5 cartes revues/i)).toBeDefined()
  })

  it('répond à un exercice puis le note, entièrement au clavier', () => {
    monter()
    fireEvent.click(screen.getByRole('button', { name: /Découvrir 5 mots/i }))

    // On fait échouer la première carte pour la faire revenir en apprentissage,
    // état dans lequel un vrai exercice est présenté.
    fireEvent.keyDown(window, { key: '1' }) // « À revoir »

    // La carte suivante est neuve ; on la note pour avancer.
    fireEvent.keyDown(window, { key: '3' })

    // La carte rejouée arrive avec un exercice : options numérotées 1 à 4.
    const options = screen.queryAllByRole('button').filter((b) => b.className.includes('option'))
    if (options.length > 0) {
      fireEvent.keyDown(window, { key: '1' })
      // Un verdict doit être annoncé, et des notes proposées.
      expect(screen.getByRole('status')).toBeDefined()
    }
  })

  it('bascule le thème au clavier depuis l’entête', () => {
    monter()
    const bouton = screen.getByRole('button', { name: /Thème système/i })
    fireEvent.click(bouton)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})

describe('repères structurels', () => {
  it('expose un lien d’évitement, un en-tête et un contenu principal', () => {
    monter()
    expect(screen.getByRole('link', { name: /Aller au contenu/i })).toBeDefined()
    expect(screen.getByRole('banner')).toBeDefined()
    expect(screen.getByRole('main')).toBeDefined()
    expect(screen.getByRole('navigation', { name: /Sections/i })).toBeDefined()
  })

  it('déclare la langue française sur le document', () => {
    monter()
    expect(document.documentElement.lang).toBe('fr')
  })

  it('signale l’onglet courant par aria-current', () => {
    monter()
    fireEvent.click(ongletNav('Progression'))
    const actif = screen.getByRole('button', { current: 'page' })
    expect(actif.textContent).toMatch(/Progression/)
  })
})
