#!/bin/sh
set -e

echo "==> Running Prisma Migrations..."
npx prisma migrate deploy

echo "==> Seeding Database..."
npx prisma db seed || echo "==> Seeding completed or skipped"

echo "==> Starting application..."
exec "$@"
