/** Page neutre affichée après une sortie rapide. */
export const EXIT_URL = 'https://www.google.com/search?q=m%C3%A9t%C3%A9o+aujourd%27hui'

/**
 * Quitte immédiatement le site. `location.replace` remplace l'entrée courante de l'historique :
 * le bouton « retour » ne ramène pas sur la conversation.
 */
export function quickExit() {
  try {
    window.sessionStorage.clear()
  } catch {
    // stockage indisponible (navigation privée) : rien à effacer
  }
  window.location.replace(EXIT_URL)
}
