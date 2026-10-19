import { DISPATCH_CUTOFF } from '@kineris/shared'
import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.ts'


/**
 * Public, real-data-only stats for the homepage's stats bar. Every number is
 * computed from whatever is actually in the database right now, never
 * hardcoded marketing copy -- so once the real catalogue/batches replace the
 * placeholder seed data, these numbers become true without a code change.
 */
export async function statsRoutes(app: FastifyInstance) {
  app.get('/api/stats', async () => {
    // Purity is averaged over the tested figures on current batch CoAs, not
    // the general spec, so the stat stays hidden until real CoAs are uploaded.
    const products = await prisma.product.findMany({
      where: { published: true, category: 'peptide' },
      include: { batches: { where: { isCurrent: true }, take: 1 } },
    })

    const compoundCount = products.length

    const purities = products
      .map((p) => p.batches[0]?.purity)
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
      dispatchLabel: `Order by ${DISPATCH_CUTOFF.label}, Mon-Fri`,
    }
  })
}
