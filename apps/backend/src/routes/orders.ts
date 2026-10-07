import { SHIPPING_OPTIONS } from '@kineris/shared'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { CUSTOMER_COOKIE } from '../lib/auth.ts'
import { DISCOUNT_FAILURE_MESSAGES, validateDiscountCode } from '../lib/discountValidation.ts'
import { prisma } from '../lib/prisma.ts'
import { requireAdmin } from '../lib/requireAuth.ts'
import { royalMailTrackingUrl } from '../lib/tracking.ts'

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

        // A provided code that fails validation rejects the whole order
        // (specific reason), rather than the old behaviour of silently
        // applying zero discount for a bad code -- the customer would
        // otherwise be charged full price without ever being told why.
        let discountMinorUnits = 0
        let validatedDiscountCodeId: string | null = null
        if (input.discountCode) {
          const result = await validateDiscountCode(input.discountCode.toUpperCase(), subtotal, input.customerEmail)
          if (!result.valid) throw new OrderError(422, DISCOUNT_FAILURE_MESSAGES[result.reason])
          discountMinorUnits = result.discountAmountMinorUnits
          validatedDiscountCodeId = result.discountCodeId
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
            ...(validatedDiscountCodeId
              ? {
                  discountRedemption: {
                    create: {
                      discountCodeId: validatedDiscountCodeId,
                      customerEmail: input.customerEmail,
                      discountAmountMinorUnits: discountMinorUnits,
                    },
                  },
                }
              : {}),
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
      include: { items: { include: { variant: { include: { product: true } }, batch: true } }, declaration: true },
    })
    if (!order) return reply.code(404).send({ error: 'Order not found.' })
    return { ...order, trackingUrl: order.trackingNumber ? royalMailTrackingUrl(order.trackingNumber) : null }
  })

  // Guest order-status lookup: both order id and email must match, so this
  // can't be used to enumerate orders by id alone. Rate-limited in
  // server.ts, same as the welcome-signup and discount-validate endpoints.
  const orderStatusSchema = z.object({ orderId: z.string().min(1), email: z.string().email() })

  app.get('/api/order-status', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req, reply) => {
    const parsed = orderStatusSchema.safeParse(req.query)
    if (!parsed.success) return reply.code(400).send({ error: 'orderId and email are required.' })

    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { items: { include: { variant: { include: { product: true } }, batch: true } } },
    })
    if (!order || order.customerEmail.toLowerCase() !== parsed.data.email.toLowerCase()) {
      return reply.code(404).send({ error: 'No order found for that order number and email.' })
    }

    return {
      ...order,
      trackingUrl: order.trackingNumber ? royalMailTrackingUrl(order.trackingNumber) : null,
    }
  })

  app.get('/api/admin/orders', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const orders = await prisma.order.findMany({
      include: { items: { include: { variant: { include: { product: true } }, batch: true } }, declaration: true },
      orderBy: { createdAt: 'desc' },
    })
    return orders.map((o) => ({ ...o, trackingUrl: o.trackingNumber ? royalMailTrackingUrl(o.trackingNumber) : null }))
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

    return { ...order, trackingUrl: royalMailTrackingUrl(order.trackingNumber ?? '') }
  })

  app.patch('/api/admin/orders/:id/deliver', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const { id } = req.params as { id: string }
    return prisma.order.update({ where: { id }, data: { status: 'delivered' } })
  })

  app.patch('/api/admin/orders/:id/refund', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const { id } = req.params as { id: string }
    return prisma.order.update({ where: { id }, data: { status: 'refunded' } })
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
