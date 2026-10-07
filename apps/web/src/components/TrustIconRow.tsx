// Copy here is restricted to what's actually true today -- not "Independent
// Lab Verified" (still an OPEN item, see docs/PROJECT_NOTES.md) and not a
// payment-specific claim like "3-D Secure" (no live Stripe key yet).
const ICONS = {
  batch: (
    <path d="M4 7h16M4 7l1.5 12a2 2 0 0 0 2 1.8h9a2 2 0 0 0 2-1.8L20 7M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
  ),
  coa: <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM14 2v6h6M8 13h8M8 17h5" />,
  truck: <path d="M3 7h11v9H3zM14 11h4l3 3v2h-7zM6.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />,
  check: <path d="M8 12l3 3 5-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
} as const

const DEFAULT_ITEMS = [
  { icon: 'batch', label: 'Batch & lot tracked' },
  { icon: 'coa', label: 'Certificate of Analysis per batch' },
  { icon: 'truck', label: 'UK dispatch' },
  { icon: 'check', label: 'RUO checkout declaration' },
] satisfies { icon: keyof typeof ICONS; label: string }[]

export function TrustIconRow({
  items = DEFAULT_ITEMS,
  condensed = false,
}: {
  items?: { icon: keyof typeof ICONS; label: string }[]
  condensed?: boolean
}) {
  return (
    <ul className={`grid gap-4 ${condensed ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4'}`}>
      {items.map((item) => (
        <li key={item.label} className="flex min-w-0 items-center gap-2.5">
          <svg
            width={condensed ? 18 : 22}
            height={condensed ? 18 : 22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-accent"
            aria-hidden="true"
          >
            {ICONS[item.icon]}
          </svg>
          <span className={`min-w-0 ${condensed ? 'text-xs text-ink-muted' : 'text-sm text-ink-muted'}`}>{item.label}</span>
        </li>
      ))}
    </ul>
  )
}
