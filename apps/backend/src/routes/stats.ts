import { SHIPPING_OPTIONS } from '@kineris/shared'
import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.ts'

// Special Delivery Guaranteed by 1pm is the fastest/most precise of the
// three configured Royal Mail placeholders -- read directly off the real
// shared config, not inferred or invented, so it stays correct if the
// options list changes shape later (falls back to the first option).
const FASTEST_OPTION = SHIPPING_OPTIONS.find((o) => o.id === 'royal-mail-special-delivery-1pm') ?? SHIPPING_OPTIONS[0]

/**
 * Public, real-data-only stats for the homepage's stats bar. Every number is
 * computed from whatever is actually in the database right now, never
 * hardcoded marketing copy -- so once the real catalogue/batches replace the
 * placeholder seed data, these numbers become true without a code change.
 */
export async function statsRoutes(app: FastifyInstance) {
  app.get('/api/stats', async () => {
    const products = await prisma.product.findMany({
      where: { published: true },
      include: { variants: { take: 1 } },
    })

    const compoundCount = products.length

    const purities = products
      .map((p) => p.variants[0]?.purity)
      .filter((p): p is string => Boolean(p))
      .map((p) => Number(p.match(/(\d+(?:\.\d+)?)/)?.[1]))
      .filter((n): n is number => Number.isFinite(n))

    const avgPurityPercent =
      purities.length > 0
        ? Math.round((purities.reduce((sum, n) => sum + n, 0) / purities.length) * 10) / 10
        : null

    return {
      compoundCount,
      avgPurityPercent,
      dispatchLabel: FASTEST_OPTION.etaLabel,
    }
  })
}
