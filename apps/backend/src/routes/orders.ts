import { SHIPPING_OPTIONS } from '@kineris/shared'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { CUSTOMER_COOKIE } from '../lib/auth.ts'
import { prisma } from '../lib/prisma.ts'
import { requireAdmin } from '../lib/requireAuth.ts'

/**
 * Checkout supports guest and signed-in customers (pack section 8). Unlike
 * requireCustomer, this never rejects the request: an absent or expired
 * cookie just means the order is attributed to no account, which is a valid
 * guest checkout, not an error.
 */
async function optionalCustomerId(req: FastifyRequest): Promise<string | null> {
  const sessionId = req.cookies[CUSTOMER_COOKIE]
  if (!sessionId) return null
  const session = await prisma.customerSession.findUnique({ where: { id: sessionId } })
  if (!session || session.expiresAt < new Date()) return null
  return session.customerId
}

const RUO_DECLARATION_TEXT =
  'I confirm these products are being purchased for laboratory research use only, not for human or veterinary use, and I accept responsibility for handling, storage, and preparation after delivery.'
const TERMS_DECLARATION_TEXT = 'I agree to the Terms & Conditions.'

const checkoutSchema = z.object({
  customerEmail: z.string().email(),
  items: z.array(z.object({ variantId: z.string(), quantity: z.number().int().positive() })).min(1),
  shippingOptionId: z.string(),
  discountCode: z.string().optional(),
  // Pack 2.2: both declarations are required and unticked by default. The
  // API enforces this itself rather than trusting the storefront's own
  // disabled-button state, since that's the only place a false claim would
  // actually matter.
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Terms & Conditions must be accepted.' }),
  }),
  ruoAccepted: z.literal(true, {
    errorMap: () => ({ message: 'The RUO declaration must be accepted.' }),
  }),
})

export async function orderRoutes(app: FastifyInstance) {
  app.get('/api/shipping-options', async () => SHIPPING_OPTIONS)

  app.post('/api/orders', async (req, reply) => {
    const parsed = checkoutSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })
    const input = parsed.data

    const shipping = SHIPPING_OPTIONS.find((o) => o.id === input.shippingOptionId)
    if (!shipping) return reply.code(400).send({ error: 'Unknown shipping option.' })

    const customerId = await optionalCustomerId(req)

    try {
      const order = await prisma.$transaction(async (tx) => {
        let subtotal = 0
        const itemsData: {
          variantId: string
          batchId: string
          quantity: number
          unitPriceMinorUnits: number
        }[] = []

        for (const line of input.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: line.variantId },
            include: { product: { include: { batches: { where: { isCurrent: true }, take: 1 } } } },
          })
          if (!variant) throw new OrderError(400, `Unknown product variant: ${line.variantId}`)
          if (variant.stock < line.quantity) {
            throw new OrderError(409, `Not enough stock for ${variant.product.name} (${variant.size}).`)
          }
          const currentBatch = variant.product.batches[0]
          if (!currentBatch) {
            throw new OrderError(409, `${variant.product.name} has no current batch on record.`)
          }

          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: { decrement: line.quantity } },
          })

          subtotal += variant.priceMinorUnits * line.quantity
          itemsData.push({
            variantId: variant.id,
            batchId: currentBatch.id,
            quantity: line.quantity,
            unitPriceMinorUnits: variant.priceMinorUnits,
          })
        }

        let discountMinorUnits = 0
        if (input.discountCode) {
          const code = await tx.discountCode.findUnique({ where: { code: input.discountCode } })
          if (code?.active) {
            discountMinorUnits = code.percentOff
              ? Math.round((subtotal * code.percentOff) / 100)
              : (code.amountOffMinorUnits ?? 0)
          }
        }

        const totalMinorUnits = Math.max(0, subtotal - discountMinorUnits) + shipping.priceMinorUnits
        const now = new Date()

        const created = await tx.order.create({
          data: {
            customerId,
            customerEmail: input.customerEmail,
            shippingOptionId: input.shippingOptionId,
            discountCode: input.discountCode ?? null,
            totalMinorUnits,
            items: { create: itemsData },
            declaration: {
              create: {
                termsText: TERMS_DECLARATION_TEXT,
                ruoText: RUO_DECLARATION_TEXT,
                termsAccepted: input.termsAccepted,
                ruoAccepted: input.ruoAccepted,
                acceptedAt: now,
              },
            },
          },
          include: { items: true, declaration: true },
        })

        return created
      })

      // Payment is stubbed until real Stripe keys exist (project plan); the
      // order is created as `pending`; a real integration would create the
      // PaymentIntent before this point and only commit the order/stock
      // changes on confirmed payment, not after. Flagged, not faked.
      return reply.code(201).send(order)
    } catch (err) {
      if (err instanceof OrderError) return reply.code(err.statusCode).send({ error: err.message })
      throw err
    }
  })

  // Public by design, like Stripe's or Shopify's own order-confirmation
  // links: the id is an unguessable cuid, and a guest checkout has no
  // account to authenticate against for this page.
  app.get('/api/orders/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { variant: { include: { product: true } } } }, declaration: true },
    })
    if (!order) return reply.code(404).send({ error: 'Order not found.' })
    return order
  })

  app.get('/api/admin/orders', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    return prisma.order.findMany({
      include: { items: { include: { variant: { include: { product: true } }, batch: true } }, declaration: true },
      orderBy: { createdAt: 'desc' },
    })
  })

  const shipSchema = z.object({ trackingNumber: z.string().min(1) })

  app.patch('/api/admin/orders/:id/ship', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const { id } = req.params as { id: string }
    const parsed = shipSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })

    const order = await prisma.order.update({
      where: { id },
      data: { status: 'shipped', trackingNumber: parsed.data.trackingNumber },
    })

    // Dispatch email hook, deferred until there's an email provider wired
    // up; the pack requires marking shipped to "trigger the dispatch email"
    // (section 5), this is the point that would call it.
    app.log.info({ orderId: order.id }, 'dispatch email would send here')

    return order
  })
}

class OrderError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
  }
}
