'use client'

import { useOverlay } from '@/contexts/OverlayContext'

export function WelcomeModalTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { setOpenOverlay } = useOverlay()
  return (
    <button type="button" onClick={() => setOpenOverlay('welcome')} className={className}>
      {children}
    </button>
  )
}
