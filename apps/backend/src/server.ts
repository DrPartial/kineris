import path from 'node:path'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import Fastify from 'fastify'
import { adminAuthRoutes } from './routes/adminAuth.ts'
import { authRoutes } from './routes/auth.ts'
import { backInStockRoutes } from './routes/backInStock.ts'
import { batchRoutes } from './routes/batches.ts'
import { bundleRoutes } from './routes/bundles.ts'
import { dashboardRoutes } from './routes/dashboard.ts'
import { discountRoutes } from './routes/discounts.ts'
import { orderRoutes } from './routes/orders.ts'
import { productRoutes } from './routes/products.ts'

const app = Fastify({ logger: true })

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? 'http://localhost:3000'
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN ?? 'http://localhost:3002'

await app.register(cors, { origin: [WEB_ORIGIN, ADMIN_ORIGIN], credentials: true })
await app.register(cookie)
await app.register(multipart)
await app.register(staticFiles, {
  root: path.resolve(import.meta.dirname, '../uploads'),
  prefix: '/uploads/',
})

app.get('/health', async () => ({ ok: true }))

await app.register(productRoutes)
await app.register(bundleRoutes)
await app.register(batchRoutes)
await app.register(orderRoutes)
await app.register(discountRoutes)
await app.register(authRoutes)
await app.register(adminAuthRoutes)
await app.register(backInStockRoutes)
await app.register(dashboardRoutes)

const port = Number(process.env.PORT ?? 4000)
app.listen({ port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err)
  process.exit(1)
})
