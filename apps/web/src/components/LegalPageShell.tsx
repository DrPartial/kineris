import type { ReactNode } from 'react'

export function LegalPageShell({ title, children, html }: { title: string; children?: ReactNode; html?: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      {html ? (
        // Static policy copy from lib/policies.ts, written by us, never user input.
        <div className="legal-prose mt-6 text-sm text-ink-muted" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="mt-6 space-y-4 text-sm text-ink-muted">{children}</div>
      )}
    </div>
  )
}
