#!/bin/sh
set -e

echo "🔄 Waiting for PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "✓ PostgreSQL is ready"

echo "🔄 Generating Prisma Client..."
npx prisma generate || true

echo "🔄 Running database migrations..."
npx prisma migrate deploy 2>/dev/null || npx prisma db push --skip-generate || true

echo "✓ Database ready"
echo "🚀 Starting application..."

# If command is passed, use it; otherwise default to npm run dev
if [ $# -gt 0 ]; then
  exec "$@"
else
  exec npm run dev
fi
