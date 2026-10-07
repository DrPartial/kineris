import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.ts'
import { requireAdmin } from '../lib/requireAuth.ts'

const UPLOAD_DIR = path.resolve(import.meta.dirname, '../../uploads/coa')

/**
 * Local filesystem storage for dev (project plan: cloud storage is a
 * deploy-time decision, deferred). The file is served back at
 * /uploads/coa/<filename>, see server.ts's static-file registration.
 */
export async function batchRoutes(app: FastifyInstance) {
  app.post('/api/admin/products/:productId/batches', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const { productId } = req.params as { productId: string }

    const parts = req.parts()
    let batchNumber: string | undefined
    let purity: string | null = null
    let reportedAt: Date | null = null
    let coaFileUrl: string | null = null

    for await (const part of parts) {
      if (part.type === 'field' && part.fieldname === 'batchNumber') {
        batchNumber = String(part.value)
      } else if (part.type === 'field' && part.fieldname === 'purity') {
        purity = String(part.value) || null
      } else if (part.type === 'field' && part.fieldname === 'reportedAt') {
        const value = String(part.value)
        reportedAt = value ? new Date(value) : null
      } else if (part.type === 'file' && part.fieldname === 'coaFile') {
        await mkdir(UPLOAD_DIR, { recursive: true })
        const filename = `${randomUUID()}.pdf`
        await pipeline(part.file, createWriteStream(path.join(UPLOAD_DIR, filename)))
        coaFileUrl = `/uploads/coa/${filename}`
      }
    }

    if (!batchNumber) return reply.code(400).send({ error: 'batchNumber is required.' })

    // The new batch becomes current; every other batch for this product stops being.
    const batch = await prisma.$transaction(async (tx) => {
      await tx.batch.updateMany({ where: { productId }, data: { isCurrent: false } })
      return tx.batch.create({
        data: { productId, batchNumber, purity, reportedAt, coaFileUrl, isCurrent: true },
      })
    })

    return reply.code(201).send(batch)
  })

  app.get('/api/admin/products/:productId/batches', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const { productId } = req.params as { productId: string }
    return prisma.batch.findMany({ where: { productId }, orderBy: { createdAt: 'desc' } })
  })

  // Public CoA lookup by batch number (pack 8: "Certificates of Analysis:
  // testing process and a CoA lookup by batch number").
  app.get('/api/coa-lookup', async (req, reply) => {
    const { batchNumber } = req.query as { batchNumber?: string }
    if (!batchNumber) return reply.code(400).send({ error: 'batchNumber query param is required.' })
    const batch = await prisma.batch.findFirst({
      where: { batchNumber },
      include: { product: { select: { name: true, slug: true } } },
    })
    if (!batch) return reply.code(404).send({ error: 'No batch found with that number.' })
    return batch
  })

  // Public feed of every current batch, newest-tested-first, for the Quality
  // page's "Recent CoAs" section. Real stored batches only, never mocked
  // rows; a batch with no uploaded PDF still appears, just without a
  // download link.
  app.get('/api/coas', async () => {
    const batches = await prisma.batch.findMany({
      where: { isCurrent: true },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: [{ reportedAt: 'desc' }, { createdAt: 'desc' }],
    })
    return batches
  })
}
