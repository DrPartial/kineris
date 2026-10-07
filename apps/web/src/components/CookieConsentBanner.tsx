'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'kineris_cookie_consent'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      // Storage unavailable: skip the banner rather than show it forever.
    }
  }, [])

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'accepted')
    } catch {
      // Nothing to persist to, the banner just reappears on the next visit.
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    // bottom-16 on mobile clears MobileNav (fixed, ~56px tall, lg:hidden)
    // instead of covering it; lg:bottom-0 once the bottom nav is gone.
    <div className="fixed inset-x-0 bottom-16 z-50 border-t border-border-strong bg-surface px-4 py-4 lg:bottom-0">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-sm text-ink-muted">
          We use essential cookies to run this site, and analytics cookies to understand how it&rsquo;s used. See
          our{' '}
          <a href="/legal/cookies" className="text-accent hover:text-accent-hover">
            Cookie Policy
          </a>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-sm bg-accent px-4 py-2 text-sm font-medium text-bone hover:bg-accent-hover"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
