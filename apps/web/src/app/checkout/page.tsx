'use client'

import type { Product, ShippingOption } from '@kineris/shared'
import { UK_ONLY_COUNTRY_CODE } from '@kineris/shared'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { api, ApiError } from '@/lib/api'
import { formatGBP } from '@/lib/money'

interface ResolvedVariant {
  productName: string
  size: string
  priceMinorUnits: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { lines, clear } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [shippingOptionId, setShippingOptionId] = useState('')
  const [email, setEmail] = useState('')
  const [discountCode, setDiscountCode] = useState('')
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

  const variantMap = new Map<string, ResolvedVariant>()
  for (const p of products) {
    for (const v of p.variants) variantMap.set(v.id, { productName: p.name, size: v.size, priceMinorUnits: v.priceMinorUnits })
  }

  const subtotal = lines.reduce((sum, l) => sum + (variantMap.get(l.variantId)?.priceMinorUnits ?? 0) * l.quantity, 0)
  const shipping = shippingOptions.find((s) => s.id === shippingOptionId)
  const total = subtotal + (shipping?.priceMinorUnits ?? 0)

  const canSubmit = lines.length > 0 && email && shippingOptionId && termsAccepted && ruoAccepted && !submitting

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
          discountCode: discountCode || undefined,
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
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Contact</h2>
            <a href="/account/sign-in" className="text-xs text-accent hover:text-accent-hover">
              Already have an account? Sign in
            </a>
          </div>
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
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
          <input
            placeholder="Optional"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          />
        </section>

        <section className="rounded-sm border border-border bg-surface p-4">
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
          className="w-full rounded-sm bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
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
