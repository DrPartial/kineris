'use client'

import { DISPATCH_CUTOFF } from '@kineris/shared'
import { useEffect, useState } from 'react'

/** Current UK wall-clock time as day-of-week (0 = Sunday) and minutes since midnight. */
function ukNow(): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

function message(): string {
  const { day, minutes } = ukNow()
  const cutoff = DISPATCH_CUTOFF.hour * 60 + DISPATCH_CUTOFF.minute
  const weekday = day >= 1 && day <= 5
  if (weekday && minutes < cutoff) {
    const left = cutoff - minutes
    const h = Math.floor(left / 60)
    const m = left % 60
    return `Order in ${h > 0 ? `${h}h ` : ''}${m}m for dispatch today`
  }
  return `Order by ${DISPATCH_CUTOFF.label} Mon-Fri for same-day dispatch; orders now go out ${
    day === 5 || day === 6 || (day === 0) ? 'on Monday' : 'tomorrow'
  }`
}

/**
 * Live same-day dispatch countdown (Becker/Hormozi "time delay"): rendered
 * only after mount, since it depends on the visitor's clock, so the server
 * and client HTML never disagree. Bank holidays aren't modelled.
 */
export function DispatchCountdown({ className = '' }: { className?: string }) {
  const [text, setText] = useState<string | null>(null)
  useEffect(() => {
    setText(message())
    const id = window.setInterval(() => setText(message()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  if (!text) return <p className={className}>Order by {DISPATCH_CUTOFF.label} Mon-Fri for same-day dispatch</p>
  return <p className={className}>{text}</p>
}
