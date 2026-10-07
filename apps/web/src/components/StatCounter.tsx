export function StatCounter({ value, label }: { value: string; label: string }) {
  // Numeric stats (21, 98%) read best big; a worded stat (Next working day)
  // wraps badly at the same size, so it gets a smaller, non-mono treatment.
  const isShort = value.length <= 5

  return (
    <div className="text-center">
      <p
        className={
          isShort
            ? 'data-figure text-3xl font-semibold text-ink sm:text-4xl'
            : 'font-display text-xl font-semibold text-ink sm:text-2xl'
        }
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-ink-muted">{label}</p>
    </div>
  )
}
