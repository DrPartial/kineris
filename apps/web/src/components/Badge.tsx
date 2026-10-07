import type { ReactNode } from 'react'

export function Badge({
  children,
  variant = 'neutral',
}: {
  children: ReactNode
  variant?: 'verified' | 'neutral'
}) {
  const styles =
    variant === 'verified' ? 'bg-verified-soft text-verified border-transparent' : 'bg-accent-soft text-accent border-transparent'

  return (
    <span
      className={`data-figure inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      {children}
    </span>
  )
}
