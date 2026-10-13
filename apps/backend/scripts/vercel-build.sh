#!/bin/sh
# Build step for the Vercel deployment of the API (see vercel.json).
#
#  - prisma generate: the client the function imports at runtime.
#  - prisma migrate deploy: applies pending migrations, PRODUCTION builds only, so a preview build
#    can never change the live database. Migrations need the direct (non-pooled) connection.
#  - seed: only when RUN_SEED=1 is set for a build (one-off, then remove it). The seed script
#    refuses to touch a hosted database without SEED_CONFIRM_REMOTE=yes, which we set here.
#  - @kineris/shared ships as TypeScript source (the web app transpiles it, tsx runs it locally), but
#    Node can't load .ts files from node_modules at runtime. So in this build container only, compile
#    it to JS and point its package.json at the output. Nothing here is committed back.
set -e

(cd ../../packages/shared \
  && pnpm exec tsc -p tsconfig.build.json \
  && node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.main = './dist/index.js';
pkg.exports = { '.': { types: './src/index.ts', default: './dist/index.js' } };
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
")

pnpm exec prisma generate

if [ "$VERCEL_ENV" = "production" ] && [ -n "$DATABASE_URL_UNPOOLED" ]; then
  DATABASE_URL="$DATABASE_URL_UNPOOLED" pnpm exec prisma migrate deploy
else
  echo "Skipping migrations (VERCEL_ENV=$VERCEL_ENV, DATABASE_URL_UNPOOLED set: $([ -n "$DATABASE_URL_UNPOOLED" ] && echo yes || echo no))"
fi

if [ "$RUN_SEED" = "1" ]; then
  SEED_CONFIRM_REMOTE=yes DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}" pnpm exec tsx prisma/seed.ts
fi
