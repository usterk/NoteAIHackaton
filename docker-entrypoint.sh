#!/bin/sh
set -e

echo ">>> Running Prisma DB Push..."
npx prisma db push --skip-generate --accept-data-loss

echo ">>> Starting Next.js server..."
exec node server.js
