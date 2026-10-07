import type { ReactNode } from 'react'

export function LegalPageShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 text-xs text-ink-hint">
        Placeholder text for the local build. Final legal text to be supplied by Sean and Connor
        before this goes live.
      </p>
      <div className="mt-6 space-y-4 text-sm text-ink-muted">{children}</div>
    </div>
  )
}
