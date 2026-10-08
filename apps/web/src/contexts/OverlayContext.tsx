'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export type OverlayName = 'drawer' | 'search' | 'account' | 'welcome' | 'cart' | null

interface OverlayContextValue {
  openOverlay: OverlayName
  setOpenOverlay: (overlay: OverlayName) => void
}

const OverlayContext = createContext<OverlayContextValue | null>(null)

/**
 * One shared "which overlay is open" slot, so the bottom nav, header,
 * checkout, footer CTA, and the arrival modal can all open the same mounted
 * overlay instances (in layout.tsx) instead of each owning its own.
 */
export function OverlayProvider({ children }: { children: ReactNode }) {
  const [openOverlay, setOpenOverlay] = useState<OverlayName>(null)
  return <OverlayContext.Provider value={{ openOverlay, setOpenOverlay }}>{children}</OverlayContext.Provider>
}

export function useOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext)
  if (!ctx) throw new Error('useOverlay must be used within OverlayProvider')
  return ctx
}
