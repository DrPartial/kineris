'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Modal } from './Modal'
import { useOverlay } from '@/contexts/OverlayContext'
import { api, ApiError } from '@/lib/api'

const STORAGE_KEY = 'kl_welcome_seen'
const SUPPRESSED_PREFIXES = ['/cart', '/checkout', '/account', '/legal']

export function WelcomeModal() {
  const pathname = usePathname()
  const { openOverlay, setOpenOverlay } = useOverlay()
  const open = openOverlay === 'welcome'
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedRef = useRef(false)

  const suppressed = SUPPRESSED_PREFIXES.some((p) => pathname?.startsWith(p))

  useEffect(() => {
    if (suppressed || firedRef.current) return
    let seen = false
    try {
      seen = window.localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      // Storage unavailable: don't show the modal rather than show it every load.
      return
    }
    if (seen) return

    function fire() {
      if (firedRef.current) return
      firedRef.current = true
      setOpenOverlay('welcome')
    }

    timerRef.current = setTimeout(fire, 4000)
    const onScroll = () => fire()
    window.addEventListener('scroll', onScroll, { once: true, passive: true })

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      window.removeEventListener('scroll', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suppressed])

  function markSeen() {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Private browsing or full storage: the modal may reappear next visit, not fatal.
    }
  }

  function close() {
    markSeen()
    setOpenOverlay(null)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api('/api/welcome-signup', { method: 'POST', body: JSON.stringify({ email, consentMarketing: consent }) })
      markSeen()
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong, try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={close} label="Get 10% off your first order">
      <div className="w-[min(90vw,24rem)] rounded-md border border-border bg-surface p-6">
        <button type="button" onClick={close} aria-label="Close" className="float-right text-ink-hint hover:text-ink">
          &times;
        </button>
        {submitted ? (
          <div>
            <h2 className="text-lg font-semibold text-ink">Check your email</h2>
            <p className="mt-2 text-sm text-ink-muted">
              If that address isn&rsquo;t already subscribed, a single-use 10% code is on its way to {email}.
            </p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 className="text-lg font-semibold text-ink">Get 10% off your first order</h2>
            <p className="mt-1 text-sm text-ink-muted">Research peptides, batch-tested, UK dispatched.</p>
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-4 w-full rounded-sm border border-border px-3 py-2 text-sm"
            />
            <label className="mt-3 flex items-start gap-2 text-xs text-ink-muted">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
              Email me about new batches, restocks and offers.
            </label>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-bone hover:bg-accent-hover disabled:opacity-50"
            >
              Send me my code
            </button>
            <p className="mt-3 text-xs text-ink-hint">For laboratory research use only. Not for human or veterinary use.</p>
          </form>
        )}
      </div>
    </Modal>
  )
}
