'use client'

import { useEffect, useRef, useState } from 'react'

const COUNT_MS = 1200

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

/**
 * One stat. Numbers read big; a worded value ("Next working day") is set smaller and may wrap
 * to two lines, so the value block has a fixed height and sits on the bottom, keeping every
 * tile's figure on one baseline and every label on one line across the row.
 *
 * A purely numeric value (optionally with a trailing suffix like "%") counts up from 0 the
 * first time it scrolls into view. Server/no-JS render is the real value directly -- the
 * count-up is a client-only enhancement, never the only way to see the real number.
 */
export function StatCounter({ value, label, note }: { value: string; label: string; note?: string }) {
  const isShort = value.length <= 5
  const match = /^(\d+)(.*)$/.exec(value)
  const target = match ? Number(match[1]) : null
  const suffix = match ? match[2] : ''

  const ref = useRef<HTMLParagraphElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (target === null) return
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        let raf = 0
        function tick(now: number) {
          const t = Math.min(1, (now - start) / COUNT_MS)
          setDisplay(t >= 1 ? value : `${Math.round(target * easeOutCubic(t))}${suffix}`)
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
    // target/suffix are derived from value, which doesn't change for a mounted tile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-full min-w-0 flex-col items-center text-center">
      <p
        ref={ref}
        className={`font-display tabular-nums flex min-h-[4.5rem] items-end justify-center font-bold leading-[1.05] tracking-tight text-ink ${
          isShort ? 'text-6xl sm:text-7xl' : 'text-3xl sm:text-4xl'
        }`}
      >
        {display}
      </p>
      <p className="mt-3 text-sm font-medium text-ink-muted">{label}</p>
      {note && <p className="mt-1 text-xs text-ink-hint">{note}</p>}
    </div>
  )
}
