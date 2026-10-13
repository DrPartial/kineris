#!/bin/sh
# Build step for the Vercel deployment of the API (see vercel.json).
#
#  - prisma generate: the client the function imports at runtime.
#  - prisma migrate deploy: applies pending migrations, PRODUCTION builds only, so a preview build
#    can never change the live database. Migrations need the direct (non-pooled) connection.
#  - seed: only when RUN_SEED=1 is set for a build (one-off, then remove it). The seed script
#    refuses to touch a hosted database without SEED_CONFIRM_REMOTE=yes, which we set here.
set -e

pnpm exec prisma generate

if [ "$VERCEL_ENV" = "production" ] && [ -n "$DATABASE_URL_UNPOOLED" ]; then
  DATABASE_URL="$DATABASE_URL_UNPOOLED" pnpm exec prisma migrate deploy
else
  echo "Skipping migrations (VERCEL_ENV=$VERCEL_ENV, DATABASE_URL_UNPOOLED set: $([ -n "$DATABASE_URL_UNPOOLED" ] && echo yes || echo no))"
fi

if [ "$RUN_SEED" = "1" ]; then
  SEED_CONFIRM_REMOTE=yes DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}" pnpm exec tsx prisma/seed.ts
fi
