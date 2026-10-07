/**
 * Pack 2.1: RUO must be visible throughout the site, not hidden in the
 * footer. Rendered in the root layout so every single page carries it,
 * rather than being a per-page decision someone could forget to add.
 */
export function RuoBar() {
  return (
    <div className="bg-ruo-bar text-ruo-bar-ink text-xs tracking-wide text-center py-2 px-4">
      For laboratory research use only. Not for human or veterinary use.
    </div>
  )
}
