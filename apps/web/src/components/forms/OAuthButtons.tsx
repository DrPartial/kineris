// No OAuth app registration/credentials exist yet (that's Sean/Connor's
// call, per the instruction pack). Stubbed disabled per the spec's own
// instruction ("stub them behind a feature flag... rather than removing
// them") so the UI is ready the moment real credentials land.
export function OAuthButtons() {
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled
        title="Coming soon"
        className="flex w-full items-center justify-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm font-medium text-ink-hint opacity-60"
      >
        Continue with Google
        <span className="text-xs">(coming soon)</span>
      </button>
      <button
        type="button"
        disabled
        title="Coming soon"
        className="flex w-full items-center justify-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm font-medium text-ink-hint opacity-60"
      >
        Continue with Apple
        <span className="text-xs">(coming soon)</span>
      </button>
    </div>
  )
}
