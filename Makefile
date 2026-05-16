.PHONY: help build up down logs clean test lint migrate dev-up prod-up

help:
	@echo "📚 Lesson Plan Manager - Makefile Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev-up          - Levanta stack em modo desenvolvimento com hot-reload"
	@echo "  make dev-down        - Para os containers de desenvolvimento"
	@echo "  make dev-logs        - Exibe logs dos containers"
	@echo ""
	@echo "Production:"
	@echo "  make prod-up         - Levanta stack em modo produção"
	@echo "  make prod-down       - Para os containers de produção"
	@echo ""
	@echo "Database:"
	@echo "  make migrate         - Roda Prisma migrations"
	@echo "  make migrate-dev     - Roda migrations em dev"
	@echo "  make seed            - Seed database (opcional)"
	@echo ""
	@echo "Testing:"
	@echo "  make test            - Roda testes backend (Jest)"
	@echo "  make test-coverage   - Roda testes com coverage"
	@echo "  make test-e2e        - Roda testes E2E (Cypress)"
	@echo ""
	@echo "Linting & Formatting:"
	@echo "  make lint            - Roda ESLint"
	@echo "  make lint-fix        - Fixa problemas de lint"
	@echo "  make format          - Roda Prettier"
	@echo ""
	@echo "Cleaning:"
	@echo "  make clean           - Remove node_modules, dist, logs"
	@echo "  make clean-docker    - Remove containers e volumes"
	@echo ""
	@echo "Other:"
	@echo "  make install         - Instala dependências backend + frontend"
	@echo "  make health          - Verifica health dos serviços"

# Development commands
dev-up:
	docker-compose -f docker-compose.dev.yml up

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Production commands
prod-up:
	docker-compose up --build -d

prod-down:
	docker-compose down

# Database commands
migrate:
	cd backend && npx prisma migrate deploy

migrate-dev:
	cd backend && npx prisma migrate dev

seed:
	cd backend && npm run db:seed

# Testing
test:
	cd backend && npm test

test-coverage:
	cd backend && npm run test:coverage

test-e2e:
	cd frontend && npm run cypress:run

# Linting and formatting
lint:
	cd backend && npm run lint
	cd frontend && npm run lint

lint-fix:
	cd backend && npm run lint:fix
	cd frontend && npm run lint:fix

format:
	cd backend && npx prettier --write "src/**/*.js"
	cd frontend && npx prettier --write "src/**/*.{js,jsx}"

# Cleaning
clean:
	find . -type d -name node_modules -prune -exec rm -rf {} \;
	find . -type d -name dist -prune -exec rm -rf {} \;
	find . -type d -name coverage -prune -exec rm -rf {} \;
	find . -type f -name "*.log" -delete

clean-docker:
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v

# Installation
install:
	cd backend && npm install
	cd frontend && npm install

# Health check
health:
	@echo "Checking services health..."
	@curl -s http://localhost:3000/health | jq . || echo "Backend not responding"
	@curl -s http://localhost:5173 > /dev/null && echo "✓ Frontend is up" || echo "✗ Frontend is down"
	@docker ps --filter "name=postgres" --format "{{.Names}}" | grep -q postgres && echo "✓ PostgreSQL is up" || echo "✗ PostgreSQL is down"
	@docker ps --filter "name=redis" --format "{{.Names}}" | grep -q redis && echo "✓ Redis is up" || echo "✗ Redis is down"