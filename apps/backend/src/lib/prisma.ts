import { PrismaClient } from '@prisma/client'

// One client for the process. Fastify's plugin lifecycle already keeps this
// to a single instance per server start; re-creating it per-request is the
// usual accidental-connection-pool-exhaustion bug this avoids.
export const prisma = new PrismaClient()
