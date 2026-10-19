// Kineris has committed to independent third-party testing of every batch
// (Sean, October 2026), so "Third-party tested" is used; every batch needs a
// real independent CoA behind it before launch. No payment-specific claim
// like "3-D Secure" (no live payment provider yet).
const ICONS = {
  batch: (
    <path d="M4 7h16M4 7l1.5 12a2 2 0 0 0 2 1.8h9a2 2 0 0 0 2-1.8L20 7M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
  ),
  coa: <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM14 2v6h6M8 13h8M8 17h5" />,
  truck: <path d="M3 7h11v9H3zM14 11h4l3 3v2h-7zM6.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />,
  check: <path d="M8 12l3 3 5-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  flask: <path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7.5 15h9" />,
  pin: <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
} as const

export type TrustIcon = keyof typeof ICONS

const DEFAULT_ITEMS = [
  { icon: 'check', label: 'Third-party tested' },
  { icon: 'coa', label: 'CoA for every batch' },
  { icon: 'truck', label: 'Same-day dispatch, order by 2.30pm' },
  { icon: 'batch', label: 'UK-based specialists' },
] satisfies { icon: keyof typeof ICONS; label: string }[]

export function TrustIconRow({
  items = DEFAULT_ITEMS,
  condensed = false,
  centered = false,
}: {
  items?: { icon: keyof typeof ICONS; label: string }[]
  condensed?: boolean
  /** Centre the items as an evenly gapped row (full-width strips), instead of four equal grid columns. */
  centered?: boolean
}) {
  return (
    <ul
      className={
        centered
          ? 'flex flex-wrap items-center justify-center gap-x-10 gap-y-3'
          : `grid gap-4 ${items.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`
      }
    >
      {items.map((item) => (
        <li key={item.label} className={`flex items-center gap-2.5 ${centered ? '' : 'min-w-0'}`}>
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
