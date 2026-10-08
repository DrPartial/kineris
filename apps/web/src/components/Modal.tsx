'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const TRANSITION_MS = 300

/**
 * One accessible overlay primitive -- focus trap, ESC and backdrop-click to
 * close, focus restored to whatever triggered it -- that every modal/drawer
 * in the app composes instead of reimplementing this four times.
 *
 * Stays mounted for TRANSITION_MS after `open` goes false so it can animate
 * out instead of vanishing: a left/right align slides off its own edge, a
 * centered one fades and scales down slightly, never from/to scale(0) (see
 * the design-eng guidance this follows -- nothing in the real world appears
 * from nothing).
 *
 * z-40, deliberately below RuoBar's z-50 (see RuoBar.tsx) so the RUO
 * statement stays visible above every overlay without duplicating its copy
 * inside each one.
 */
export function Modal({
  open,
  onClose,
  children,
  label,
  align = 'center',
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  label: string
  /** 'center' for a dialog, 'left'/'right' for a slide-in drawer/panel. */
  align?: 'center' | 'left' | 'right'
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)
  const [mounted, setMounted] = useState(open)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      // Start the transition on the next frame, not this one, so the browser
      // paints the off-screen/faded starting position first -- doing it in
      // the same frame as mounting would skip straight to the end state.
      const raf = requestAnimationFrame(() => setEntered(true))
      return () => cancelAnimationFrame(raf)
    }
    setEntered(false)
    const timeout = setTimeout(() => setMounted(false), TRANSITION_MS)
    return () => clearTimeout(timeout)
  }, [open])

  useEffect(() => {
    if (!open) return
    triggerRef.current = document.activeElement
    const panel = panelRef.current
    const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE)
    focusable?.[0]?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const items = panel.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus()
    }
  }, [open, onClose])

  if (!mounted) return null

  const panelPosition =
    align === 'center'
      ? 'inset-0 flex items-center justify-center p-4'
      : align === 'left'
        ? 'inset-y-0 left-0 flex'
        : 'inset-y-0 right-0 flex'

  const panelTransform =
    align === 'center'
      ? entered
        ? 'scale-100 opacity-100'
        : 'scale-95 opacity-0'
      : entered
        ? 'translate-x-0'
        : align === 'left'
          ? '-translate-x-full'
          : 'translate-x-full'

  return (
    <div className="fixed inset-0 z-40" role="presentation">
      <div
        className={`absolute inset-0 bg-pine-ink/40 transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${entered ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`absolute ${panelPosition}`}>
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={`max-h-full transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${panelTransform}`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
