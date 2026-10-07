'use client'

import type { DiscountValidationResult, Product, ShippingOption } from '@kineris/shared'
import { UK_ONLY_COUNTRY_CODE } from '@kineris/shared'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { api, ApiError } from '@/lib/api'
import { formatGBP } from '@/lib/money'

interface ResolvedVariant {
  productName: string
  size: string
  priceMinorUnits: number
}

type ContactMode = 'guest' | 'sign-in' | 'create-account'

export default function CheckoutPage() {
  const router = useRouter()
  const { lines, clear } = useCart()
  const { customer, refresh } = useCustomerAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [shippingOptionId, setShippingOptionId] = useState('')

  const [contactMode, setContactMode] = useState<ContactMode>('guest')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)
  const [contactSubmitting, setContactSubmitting] = useState(false)

  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; discountAmountMinorUnits: number } | null>(null)
  const [discountError, setDiscountError] = useState<string | null>(null)
  const [validatingDiscount, setValidatingDiscount] = useState(false)

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [ruoAccepted, setRuoAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api<Product[]>('/api/products'), api<ShippingOption[]>('/api/shipping-options')]).then(
      ([p, s]) => {
        setProducts(p)
        setShippingOptions(s)
        setShippingOptionId(s[0]?.id ?? '')
      },
    )
  }, [])

  useEffect(() => {
    if (customer && customer !== 'loading') setEmail(customer.email)
  }, [customer])

  const variantMap = new Map<string, ResolvedVariant>()
  for (const p of products) {
    for (const v of p.variants) variantMap.set(v.id, { productName: p.name, size: v.size, priceMinorUnits: v.priceMinorUnits })
  }

  const subtotal = lines.reduce((sum, l) => sum + (variantMap.get(l.variantId)?.priceMinorUnits ?? 0) * l.quantity, 0)
  const shipping = shippingOptions.find((s) => s.id === shippingOptionId)
  const discountMinorUnits = appliedDiscount?.discountAmountMinorUnits ?? 0
  const total = Math.max(0, subtotal - discountMinorUnits) + (shipping?.priceMinorUnits ?? 0)

  const signedIn = customer && customer !== 'loading'
  const canSubmit = lines.length > 0 && email && shippingOptionId && termsAccepted && ruoAccepted && !submitting

  async function inlineSignIn() {
    setContactSubmitting(true)
    setContactError(null)
    try {
      await api('/api/auth/log-in', { method: 'POST', body: JSON.stringify({ email, password }) })
      await refresh()
    } catch (err) {
      setContactError(err instanceof ApiError ? err.message : 'Something went wrong signing in.')
    } finally {
      setContactSubmitting(false)
    }
  }

  async function inlineCreateAccount() {
    setContactSubmitting(true)
    setContactError(null)
    try {
      await api('/api/auth/sign-up', { method: 'POST', body: JSON.stringify({ email, password }) })
      await refresh()
    } catch (err) {
      setContactError(err instanceof ApiError ? err.message : 'Something went wrong creating your account.')
    } finally {
      setContactSubmitting(false)
    }
  }

  async function applyDiscount() {
    if (!discountCode) return
    setValidatingDiscount(true)
    setDiscountError(null)
    try {
      const result = await api<DiscountValidationResult>('/api/discount-codes/validate', {
        method: 'POST',
        body: JSON.stringify({ code: discountCode.toUpperCase(), subtotalMinorUnits: subtotal, customerEmail: email }),
      })
      if (result.valid) {
        setAppliedDiscount({ code: discountCode.toUpperCase(), discountAmountMinorUnits: result.discountAmountMinorUnits })
      }
    } catch (err) {
      setAppliedDiscount(null)
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { message?: string } | null
        setDiscountError(body?.message ?? 'That code isn’t valid.')
      } else {
        setDiscountError('Something went wrong checking that code.')
      }
    } finally {
      setValidatingDiscount(false)
    }
  }

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const order = await api<{ id: string }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerEmail: email,
          items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
          shippingOptionId,
          discountCode: appliedDiscount?.code || undefined,
          termsAccepted,
          ruoAccepted,
        }),
      })
      clear()
      router.push(`/order-confirmation/${order.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong placing your order.')
      setSubmitting(false)
    }
  }

  if (lines.length === 0) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-ink-muted">Your cart is empty.</div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Checkout</h1>

      <div className="mt-6 space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-medium text-ink">Contact</h2>

          {signedIn ? (
            <p className="rounded-sm border border-border bg-surface-page px-3 py-2 text-sm text-ink">
              Signed in as {email}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['guest', 'Guest checkout'],
                  ['sign-in', 'Sign in'],
                  ['create-account', 'Create account'],
                ] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setContactMode(mode)
                      setContactError(null)
                    }}
                    className={`rounded-sm border px-3 py-2 text-sm font-medium ${
                      contactMode === mode ? 'border-accent bg-accent-soft text-accent' : 'border-border text-ink-muted hover:border-accent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-3 space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-sm border border-border px-3 py-2 text-sm"
                />

                {contactMode !== 'guest' && (
                  <>
                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-sm border border-border px-3 py-2 text-sm"
                    />
                    {contactMode === 'create-account' && (
                      <label className="flex items-start gap-2 rounded-sm border border-border bg-surface-page p-3 text-sm text-ink-muted">
                        <input
                          type="checkbox"
                          checked={marketingConsent}
                          onChange={(e) => setMarketingConsent(e.target.checked)}
                          className="mt-0.5"
                        />
                        Email me about new batches, restocks and offers.
                      </label>
                    )}
                    {contactError && <p className="text-sm text-red-600">{contactError}</p>}
                    <button
                      type="button"
                      disabled={contactSubmitting || !email || !password}
                      onClick={contactMode === 'sign-in' ? inlineSignIn : inlineCreateAccount}
                      className="rounded-sm border border-ink px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken disabled:opacity-50"
                    >
                      {contactMode === 'sign-in' ? 'Sign in' : 'Create account'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-ink">Shipping address</h2>
          <p className="mb-3 text-xs text-ink-hint">UK addresses only at launch.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Address line 1" className="rounded-sm border border-border px-3 py-2 text-sm sm:col-span-2" />
            <input placeholder="Town / city" className="rounded-sm border border-border px-3 py-2 text-sm" />
            <input placeholder="Postcode" className="rounded-sm border border-border px-3 py-2 text-sm" />
            <input value="United Kingdom" disabled className="rounded-sm border border-border bg-surface-sunken px-3 py-2 text-sm text-ink-muted sm:col-span-2" />
          </div>
          <input type="hidden" value={UK_ONLY_COUNTRY_CODE} readOnly />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-ink">Shipping method</h2>
          <div className="space-y-2">
            {shippingOptions.map((opt) => (
              <label key={opt.id} className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingOptionId === opt.id}
                    onChange={() => setShippingOptionId(opt.id)}
                  />
                  {opt.label} <span className="text-ink-hint">({opt.etaLabel})</span>
                </span>
                <span className="data-figure">{formatGBP(opt.priceMinorUnits)}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-ink">Discount code</h2>
          {appliedDiscount ? (
            <div className="flex items-center justify-between rounded-sm border border-accent bg-accent-soft px-3 py-2 text-sm text-accent">
              <span className="data-figure">{appliedDiscount.code} applied</span>
              <button
                type="button"
                onClick={() => {
                  setAppliedDiscount(null)
                  setDiscountCode('')
                }}
                className="text-xs underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                placeholder="Optional"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                className="flex-1 rounded-sm border border-border px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={!discountCode || !email || validatingDiscount}
                onClick={applyDiscount}
                className="rounded-sm border border-ink px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          )}
          {discountError && <p className="mt-2 text-sm text-red-600">{discountError}</p>}
          {!email && !appliedDiscount && <p className="mt-2 text-xs text-ink-hint">Enter your email above first.</p>}
        </section>

        <section className="rounded-md border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-medium text-ink">Order summary</h2>
          <ul className="space-y-1 text-sm">
            {lines.map((l) => {
              const v = variantMap.get(l.variantId)
              if (!v) return null
              return (
                <li key={l.variantId} className="flex justify-between">
                  <span className="text-ink-muted">
                    {v.productName} ({v.size}) &times; {l.quantity}
                  </span>
                  <span className="data-figure">{formatGBP(v.priceMinorUnits * l.quantity)}</span>
                </li>
              )
            })}
          </ul>
          {appliedDiscount && (
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm text-accent">
              <span>Discount ({appliedDiscount.code})</span>
              <span className="data-figure">-{formatGBP(discountMinorUnits)}</span>
            </div>
          )}
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
            <span className="text-ink-muted">Shipping</span>
            <span className="data-figure">{shipping ? formatGBP(shipping.priceMinorUnits) : '...'}</span>
          </div>
          <div className="mt-2 flex justify-between text-base font-semibold text-ink">
            <span>Total</span>
            <span className="data-figure">{formatGBP(total)}</span>
          </div>
        </section>

        {/* Pack 2.2: both declarations are required, unticked by default, and
            the order cannot be placed until both are ticked. canSubmit below
            enforces this on the button; the API enforces it again server-side. */}
        <section className="space-y-3">
          <label className="flex items-start gap-2 text-sm text-ink-muted">
            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5" />
            I agree to the{' '}
            <a href="/legal/terms" className="text-accent hover:text-accent-hover">
              Terms &amp; Conditions
            </a>
            .
          </label>
          <label className="flex items-start gap-2 text-sm text-ink-muted">
            <input type="checkbox" checked={ruoAccepted} onChange={(e) => setRuoAccepted(e.target.checked)} className="mt-0.5" />
            I confirm these products are being purchased for laboratory research use only, not for
            human or veterinary use, and I accept responsibility for handling, storage, and
            preparation after delivery.
          </label>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="w-full rounded-sm bg-accent px-5 py-3 text-sm font-medium text-bone hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? 'Placing order...' : `Place order, ${formatGBP(total)}`}
        </button>
        <p className="text-center text-xs text-ink-hint">
          Payment is in test mode until live Stripe keys are configured.
        </p>
      </div>
    </div>
  )
}
