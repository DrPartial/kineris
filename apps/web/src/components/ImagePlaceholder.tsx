/**
 * No product photography exists yet (pack 2.4's imagery rules are lab/
 * product shots only, never people or lifestyle scenes), so every image slot
 * in the site renders this branded card instead of a bare gray box. One
 * component means dropping in real photography later only touches this file.
 */
export function ImagePlaceholder({
  label,
  formula,
  className = '',
}: {
  label: string
  formula?: string | null
  className?: string
}) {
  return (
    <div
      role="img"
      aria-label={`${label}, product photography not yet available`}
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface-sunken p-6 text-center ${className}`}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="text-accent">
        <path d="M9 2h6M10 2v5.2a3 3 0 0 1-.4 1.5L5.8 15.5A3 3 0 0 0 5 17.3V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2.7a3 3 0 0 0-.8-1.8l-3.8-6.6a3 3 0 0 1-.4-1.5V2" />
        <path d="M7.5 14.5h9" />
      </svg>
      <p className="text-sm font-medium text-ink">{label}</p>
      {formula && <p className="data-figure text-xs text-ink-hint">{formula}</p>}
    </div>
  )
}
