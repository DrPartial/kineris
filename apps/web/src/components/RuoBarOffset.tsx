'use client'

import { useEffect } from 'react'

/**
 * The RUO bar is sticky and sits above every overlay (z-50 vs z-40), so a full-height drawer's top
 * edge would be hidden under it. This publishes the bar's live height (it wraps to two lines on
 * phones) as --ruo-h so overlays can pad their top by exactly that.
 */
export function RuoBarOffset() {
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>('[data-ruo-bar]')
    if (!bar) return
    const set = () => document.documentElement.style.setProperty('--ruo-h', `${bar.offsetHeight}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [])
  return null
}
