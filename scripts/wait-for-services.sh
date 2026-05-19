#!/bin/bash

# Wait for services to be healthy
MAX_ATTEMPTS=30
ATTEMPT=0

echo "Waiting for PostgreSQL..."
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if pg_isready -h localhost -p 5432 -U user 2>/dev/null; then
    echo "✓ PostgreSQL is ready"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  sleep 1
done

echo "Waiting for Redis..."
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if redis-cli -h localhost ping 2>/dev/null | grep -q PONG; then
    echo "✓ Redis is ready"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  sleep 1
done

echo "Waiting for backend..."
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if curl -s http://localhost:3000/health | grep -q '"status":"ok"'; then
    echo "✓ Backend is ready"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  sleep 2
done

echo "Waiting for frontend..."
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if curl -s http://localhost:5173 > /dev/null; then
    echo "✓ Frontend is ready"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  sleep 2
done

echo "✓ All services are ready!"