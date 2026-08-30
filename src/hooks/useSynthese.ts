/**
 * Synthèse vocale française via l'API Web Speech.
 *
 * Pièges réels que ce hook absorbe :
 *  - `speechSynthesis.getVoices()` renvoie `[]` au premier appel sur Chrome ;
 *    la liste n'arrive qu'avec l'événement `voiceschanged`.
 *  - iOS Safari exige que le tout premier `speak()` découle d'un geste
 *    utilisateur ; un déclenchement automatique au montage reste muet.
 *  - Certains Android n'embarquent aucune voix `fr-*`. Il faut alors le dire à
 *    l'utilisateur plutôt que d'afficher un bouton qui ne fait rien.
 *  - Chrome interrompt la synthèse au bout de ~15 s ; sans objet, nos énoncés
 *    sont courts, mais on annule toujours l'énoncé précédent avant d'en lancer un.
 *
 * Aucun repli cloud au MVP : cela impliquerait une clé d'API, un backend et
 * l'envoi du contenu à un tiers pour un gain marginal sur des mots isolés.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface Synthese {
  /** `false` si l'API est absente ou si aucune voix française n'est installée. */
  disponible: boolean
  /** `true` tant qu'un énoncé est en cours. */
  enCours: boolean
  /** Nom de la voix retenue, pour l'afficher dans les réglages. */
  voix: string | null
  parler: (texte: string) => void
  stopper: () => void
}

function choisirVoixFr(voix: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const fr = voix.filter((v) => v.lang.toLowerCase().startsWith('fr'))
  if (!fr.length) return null
  // On préfère fr-FR, puis une voix locale (pas de latence réseau), puis la première.
  return (
    fr.find((v) => v.lang.toLowerCase() === 'fr-fr' && v.localService) ??
    fr.find((v) => v.lang.toLowerCase() === 'fr-fr') ??
    fr.find((v) => v.localService) ??
    fr[0] ??
    null
  )
}

export function useSynthese(debit = 0.95): Synthese {
  const [voix, setVoix] = useState<SpeechSynthesisVoice | null>(null)
  const [pret, setPret] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const debitRef = useRef(debit)
  debitRef.current = debit

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setPret(true)
      return
    }
    const synth = window.speechSynthesis

    const rafraichir = () => {
      const dispo = synth.getVoices()
      if (dispo.length) {
        setVoix(choisirVoixFr(dispo))
        setPret(true)
      }
    }

    rafraichir()
    synth.addEventListener('voiceschanged', rafraichir)
    // Filet de sécurité : certains navigateurs n'émettent jamais `voiceschanged`.
    const t = window.setTimeout(() => setPret(true), 1500)

    return () => {
      synth.removeEventListener('voiceschanged', rafraichir)
      window.clearTimeout(t)
      synth.cancel()
    }
  }, [])

  const stopper = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setEnCours(false)
  }, [])

  const parler = useCallback(
    (texte: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !voix) return
      const synth = window.speechSynthesis
      synth.cancel() // évite l'empilement des énoncés sur des clics rapides
      const u = new SpeechSynthesisUtterance(texte)
      u.voice = voix
      u.lang = voix.lang
      u.rate = debitRef.current
      u.pitch = 1
      u.onend = () => setEnCours(false)
      u.onerror = () => setEnCours(false)
      setEnCours(true)
      synth.speak(u)
    },
    [voix],
  )

  return {
    disponible: pret ? voix !== null : true,
    enCours,
    voix: voix?.name ?? null,
    parler,
    stopper,
  }
}
