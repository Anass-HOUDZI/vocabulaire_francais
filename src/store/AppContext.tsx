/**
 * État global de l'application.
 *
 * Choix : `useReducer` + contexte plutôt qu'une bibliothèque externe. L'état tient
 * en un seul objet sérialisable, les transitions sont peu nombreuses et toutes
 * déclenchées par l'utilisateur. Ajouter Zustand ou Redux ici n'apporterait
 * qu'une dépendance et une indirection. Le seuil de bascule est clair : le jour
 * où plusieurs sources concurrentes écrivent l'état (synchronisation serveur,
 * onglets multiples), il faudra un vrai store.
 *
 * Le réducteur reste PUR : l'horloge est toujours passée dans l'action, jamais
 * lue à l'intérieur.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import { LEXIQUE } from '../data/lexique'
import type { Carte, EtatPersiste, FormatExercice, Note, Reglages } from '../types'
import { creerCarte, jourLogique, JOUR_MS, planifier } from '../lib/srs'
import { charger, memoriserTheme, sauvegarder, type ResultatSauvegarde } from '../lib/stockage'

type Action =
  | { type: 'noter'; motId: string; note: Note; format: FormatExercice; msReponse: number; maintenant: number }
  | { type: 'suspendre'; motId: string; suspendue: boolean }
  | { type: 'reglages'; valeurs: Partial<Reglages> }
  | { type: 'remplacer'; etat: EtatPersiste }
  | { type: 'reinitialiser' }

/** Garantit une carte pour chaque mot du lexique, sans toucher aux cartes existantes. */
function synchroniserAvecLexique(etat: EtatPersiste, maintenant: number): EtatPersiste {
  const cartes = { ...etat.cartes }
  let modifie = false
  for (const mot of LEXIQUE) {
    if (!cartes[mot.id]) {
      cartes[mot.id] = creerCarte(mot.id, maintenant)
      modifie = true
    }
  }
  // Les cartes orphelines (mot retiré du lexique) sont CONSERVÉES : le mot peut
  // revenir dans une version ultérieure, et la progression n'est pas récupérable.
  return modifie ? { ...etat, cartes } : etat
}

function reducteur(etat: EtatPersiste, action: Action): EtatPersiste {
  switch (action.type) {
    case 'noter': {
      const avant = etat.cartes[action.motId]
      if (!avant) return etat
      const apres = planifier(avant, action.note, action.maintenant)

      const jour = jourLogique(action.maintenant)
      const compteurs = { ...etat.nouveauxParJourLogique }
      if (avant.etat === 'nouveau') {
        compteurs[jour] = (compteurs[jour] ?? 0) + 1
      }

      return {
        ...etat,
        cartes: { ...etat.cartes, [action.motId]: apres },
        logs: [
          ...etat.logs,
          {
            motId: action.motId,
            ts: action.maintenant,
            note: action.note,
            format: action.format,
            etatAvant: avant.etat,
            joursEcoules: avant.derniereRevision
              ? Math.max(0, (action.maintenant - avant.derniereRevision) / JOUR_MS)
              : 0,
            intervalleAvant: avant.intervalle,
            intervalleApres: apres.intervalle,
            msReponse: action.msReponse,
          },
        ],
        nouveauxParJourLogique: compteurs,
      }
    }

    case 'suspendre': {
      const carte = etat.cartes[action.motId]
      if (!carte) return etat
      return {
        ...etat,
        cartes: { ...etat.cartes, [action.motId]: { ...carte, suspendue: action.suspendue } },
      }
    }

    case 'reglages':
      return { ...etat, reglages: { ...etat.reglages, ...action.valeurs } }

    case 'remplacer':
      return action.etat

    case 'reinitialiser': {
      const vierge: Record<string, Carte> = {}
      for (const mot of LEXIQUE) vierge[mot.id] = creerCarte(mot.id, 0)
      return { ...etat, cartes: vierge, logs: [], nouveauxParJourLogique: {} }
    }
  }
}

interface Contexte {
  etat: EtatPersiste
  noter: (motId: string, note: Note, format: FormatExercice, msReponse: number) => void
  suspendre: (motId: string, suspendue: boolean) => void
  majReglages: (valeurs: Partial<Reglages>) => void
  remplacer: (etat: EtatPersiste) => void
  reinitialiser: () => void
  /** Nouveaux mots encore autorisés aujourd'hui, selon le quota. */
  nouveauxRestants: number
  /** Dernier résultat d'écriture : l'interface doit alerter si ce n'est pas « ok ». */
  etatSauvegarde: ResultatSauvegarde
}

const AppContext = createContext<Contexte | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [etat, dispatch] = useReducer(reducteur, null, () =>
    synchroniserAvecLexique(charger(), Date.now()),
  )

  const [etatSauvegarde, setEtatSauvegarde] = useState<ResultatSauvegarde>('ok')

  useEffect(() => {
    setEtatSauvegarde(sauvegarder(etat))
  }, [etat])

  // Application du thème : `data-theme` sur <html>, ou rien en mode « système »
  // pour laisser `prefers-color-scheme` décider.
  useEffect(() => {
    const racine = document.documentElement
    if (etat.reglages.theme === 'system') racine.removeAttribute('data-theme')
    else racine.setAttribute('data-theme', etat.reglages.theme)
    memoriserTheme(etat.reglages.theme)
  }, [etat.reglages.theme])

  // `index.html` porte déjà `lang="fr"`, mais le fixer aussi ici rend la racine
  // du document correcte (WCAG 3.1.1) même quand l'arbre React est monté seul —
  // c'est le cas des tests d'accessibilité, et potentiellement d'une intégration
  // future dans une page hôte qui ne connaît pas la langue du contenu.
  useEffect(() => {
    document.documentElement.lang = 'fr'
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--echelle-texte', String(etat.reglages.echelleTexte))
  }, [etat.reglages.echelleTexte])

  const noter = useCallback(
    (motId: string, note: Note, format: FormatExercice, msReponse: number) =>
      dispatch({ type: 'noter', motId, note, format, msReponse, maintenant: Date.now() }),
    [],
  )
  const suspendre = useCallback(
    (motId: string, suspendue: boolean) => dispatch({ type: 'suspendre', motId, suspendue }),
    [],
  )
  const majReglages = useCallback(
    (valeurs: Partial<Reglages>) => dispatch({ type: 'reglages', valeurs }),
    [],
  )
  const remplacer = useCallback((e: EtatPersiste) => dispatch({ type: 'remplacer', etat: e }), [])
  const reinitialiser = useCallback(() => dispatch({ type: 'reinitialiser' }), [])

  const nouveauxRestants = useMemo(() => {
    const jour = jourLogique(Date.now())
    return Math.max(0, etat.reglages.nouveauxParJour - (etat.nouveauxParJourLogique[jour] ?? 0))
  }, [etat.nouveauxParJourLogique, etat.reglages.nouveauxParJour])

  const valeur = useMemo<Contexte>(
    () => ({
      etat,
      noter,
      suspendre,
      majReglages,
      remplacer,
      reinitialiser,
      nouveauxRestants,
      etatSauvegarde,
    }),
    [etat, noter, suspendre, majReglages, remplacer, reinitialiser, nouveauxRestants, etatSauvegarde],
  )

  return <AppContext.Provider value={valeur}>{children}</AppContext.Provider>
}

export function useApp(): Contexte {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>')
  return ctx
}
