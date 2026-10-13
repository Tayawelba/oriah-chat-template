'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'n.pref'
const EVENT = 'n-pref-change'
export const DISCREET_NAME = 'Mes notes'
export const BRAND_NAME = 'Oriah Elle'

function read(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** Mode discret : l'onglet et l'en-tête affichent « Mes notes » au lieu d'Oriah Elle. */
export function useDiscreetMode(): [boolean, (value: boolean) => void] {
  const [discreet, setDiscreet] = useState(false)

  useEffect(() => {
    const sync = () => setDiscreet(read())
    sync()
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    if (discreet) document.title = DISCREET_NAME
  }, [discreet])

  function update(value: boolean) {
    try {
      if (value) window.localStorage.setItem(STORAGE_KEY, '1')
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // sans stockage, le mode reste actif jusqu'au rechargement
    }
    setDiscreet(value)
    if (!value) document.title = BRAND_NAME
    window.dispatchEvent(new Event(EVENT))
  }

  return [discreet, update]
}

export function DiscreetToggle() {
  const [discreet, setDiscreet] = useDiscreetMode()
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        className="size-4 accent-[var(--primary)]"
        checked={discreet}
        onChange={(event) => setDiscreet(event.target.checked)}
      />
      Mode discret (le site s’affiche comme « {DISCREET_NAME} »)
    </label>
  )
}
