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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
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
          className="shrink-0 rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
