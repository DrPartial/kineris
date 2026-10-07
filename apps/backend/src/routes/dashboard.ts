import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.ts'
import { requireAdmin } from '../lib/requireAuth.ts'

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/api/admin/dashboard', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return

    const [orderCount, customerCount, paidOrders, products] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.order.findMany({ where: { status: { in: ['paid', 'shipped'] } }, select: { totalMinorUnits: true } }),
      prisma.product.findMany({ include: { variants: true } }),
    ])

    const revenueMinorUnits = paidOrders.reduce((sum, o) => sum + o.totalMinorUnits, 0)

    const lowStock = products.flatMap((p) =>
      p.variants
        .filter((v) => v.stock <= p.lowStockThreshold)
        .map((v) => ({ productId: p.id, productName: p.name, variantId: v.id, size: v.size, stock: v.stock, threshold: p.lowStockThreshold })),
    )

    return { orderCount, customerCount, revenueMinorUnits, lowStock }
  })
}
