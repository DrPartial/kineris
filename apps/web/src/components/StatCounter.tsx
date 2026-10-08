/**
 * One stat. Numbers read big; a worded value ("Next working day") is set smaller and may wrap
 * to two lines, so the value block has a fixed height and sits on the bottom, keeping every
 * tile's figure on one baseline and every label on one line across the row.
 */
export function StatCounter({ value, label, note }: { value: string; label: string; note?: string }) {
  const isShort = value.length <= 5

  return (
    <div className="flex h-full min-w-0 flex-col items-center text-center">
      <p
        className={`font-display flex min-h-[4.5rem] items-end justify-center font-bold leading-[1.05] tracking-tight text-ink ${
          isShort ? 'text-6xl sm:text-7xl' : 'text-3xl sm:text-4xl'
        }`}
      >
        {value}
      </p>
      <p className="mt-3 text-sm font-medium text-ink-muted">{label}</p>
      {note && <p className="mt-1 text-xs text-ink-hint">{note}</p>}
    </div>
  )
}
