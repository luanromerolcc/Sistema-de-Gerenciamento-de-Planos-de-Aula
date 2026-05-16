# 📚 Lesson Plan Manager

Uma plataforma full-stack para docentes criarem, organizarem e consultarem planos de aula, com assistência de IA (Smart Assist) que sugere conteúdos, tópicos e tags automaticamente.

## 🎯 Funcionalidades Principais

### Core CRUD
- ✅ Criar, listar, buscar, atualizar e excluir planos de aula
- ✅ Validação end-to-end com Zod
- ✅ Filtros avançados (disciplina, tags, data)
- ✅ Full-text search PostgreSQL (tsvector)
- ✅ Paginação e sorting

### Smart Assist (IA)
- ✅ Streaming em tempo real via SSE (como ChatGPT)
- ✅ Cache Redis de respostas duplicadas
- ✅ Badge "Resposta em Cache" na UI
- ✅ Rate limiting (proteção contra abuso)
- ✅ Prompt engineering pedagógico

### Analytics & Dashboard
- ✅ Cards: total de planos, planos do mês, próximas aulas
- ✅ Gráfico de barras por disciplina (Recharts)
- ✅ Histórico de operações (audit log)

### Versões & Histórico
- ✅ Snapshot automático antes de cada edição
- ✅ Visualizar versões anteriores
- ✅ Restaurar versão com um clique
- ✅ Audit log com timestamps

### Exportações
- ✅ PDF formatado (Puppeteer)
- ✅ iCal para Google Calendar / Outlook
- ✅ Botões de download na UI

### Extras
- ✅ Duplicar plano como template
- ✅ Dark mode com preferência do SO
- ✅ Skeleton loaders elegantes
- ✅ Swagger UI em `/api/docs`
- ✅ Editor rich-text com TipTap

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + Fastify + Prisma |
| Banco | PostgreSQL (tsvector) |
| Cache | Redis |
| IA | Anthropic Claude API |
| Frontend | React + Vite + TailwindCSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack Query v5 |
| Editor | TipTap |
| Testes Backend | Jest + Supertest |
| Testes E2E | Cypress |
| CI/CD | GitHub Actions |
| Containers | Docker + docker-compose |

---

## 📦 Pré-requisitos

- **Node.js** >= 20
- **Docker** e **Docker Compose**
- **PostgreSQL** 15+ (ou via container)
- **Redis** 7+ (ou via container)
- **Chave da API Anthropic** (Claude)

---

## 🚀 Quick Start

### 1. Clone e Configure

```bash
git clone <repo>
cd lesson-plan-manager

# Crie arquivo .env no backend com suas credentials
cp backend/.env.example backend/.env
# Edite backend/.env e adicione ANTHROPIC_API_KEY
```

### 2. Levante Tudo com Docker

```bash
# Modo produção
docker-compose up --build

# Modo desenvolvimento (hot-reload)
docker-compose -f docker-compose.dev.yml up
```

### 3. Acesse os Serviços

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs
- **Health**: http://localhost:3000/health

---

## 📁 Estrutura do Projeto

```
lesson-plan-manager/
├── backend/                          # Node.js + Fastify
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js               # Validação Zod
│   │   │   ├── logger.js            # Pino JSON
│   │   │   ├── prisma.js            # Client
│   │   │   └── redis.js             # Cliente Redis
│   │   ├── modules/
│   │   │   ├── lessonPlans/         # CRUD principal
│   │   │   ├── ai/                  # Smart Assist
│   │   │   ├── analytics/           # Dashboard
│   │   │   └── exports/             # PDF + iCal
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   ├── app.js                   # Fastify instance
│   │   └── server.js                # Entry point
│   ├── prisma/
│   │   ├── schema.prisma            # Schema completo
│   │   └── migrations/
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   └── .env

├── frontend/                         # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui
│   │   │   ├── LessonPlanCard.jsx
│   │   │   ├── LessonPlanForm.jsx
│   │   │   ├── SmartAssistPanel.jsx # SSE streaming
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LessonPlansPage.jsx
│   │   │   ├── CreatePlanPage.jsx
│   │   │   └── EditPlanPage.jsx
│   │   ├── hooks/
│   │   │   ├── useLessonPlans.js    # TanStack Query
│   │   │   ├── useSmartAssist.js    # SSE hook
│   │   │   └── useTheme.js
│   │   ├── store/
│   │   │   └── filterStore.js       # Zustand
│   │   ├── services/
│   │   │   └── api.js               # Axios
│   │   └── App.jsx
│   ├── cypress/
│   │   └── e2e/
│   │       ├── crud.cy.js
│   │       ├── smart-assist.cy.js
│   │       └── filters-search.cy.js
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── cypress.config.js
│   └── package.json

├── .github/
│   └── workflows/
│       ├── ci.yml                   # Lint + Test + Build
│       └── cypress.yml              # E2E tests

├── docker-compose.yml               # Produção
├── docker-compose.dev.yml           # Desenvolvimento
├── scripts/
│   └── wait-for-services.sh         # Health check
└── README.md
```

---

## 🧪 Testes

### Backend (Jest + Supertest)

```bash
cd backend

# Rodar todos os testes
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Frontend E2E (Cypress)

```bash
cd frontend

# Abrir Cypress UI
npm run cypress:open

# Rodar headless
npm run cypress:run
```

---

## 🔧 Desenvolvendo Localmente

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Rodar em desenvolvimento (com hot-reload)
npm run dev

# Migrations
npm run db:migrate:dev

# Gerar Prisma Client
npm run db:generate

# Acessar Prisma Studio (UI para banco)
npm run db:studio
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Rodar dev server (Vite)
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

---

## 📊 Schema do Banco de Dados

```prisma
model LessonPlan {
  id            String @id @default(cuid())
  title         String
  objective     String
  summary       String @db.Text
  scheduledAt   DateTime
  discipline    String
  contents      String @db.Text
  resources     String @db.Text
  tags          String[]
  searchVector  Unsupported("tsvector")?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  versions      LessonPlanVersion[]
  auditLogs     AuditLog[]
}

model LessonPlanVersion {
  id            String @id @default(cuid())
  lessonPlanId  String
  snapshot      Json
  createdAt     DateTime @default(now())
  lessonPlan    LessonPlan @relation(fields: [lessonPlanId], references: [id], onDelete: Cascade)
}

model AuditLog {
  id            String @id @default(cuid())
  lessonPlanId  String?
  action        String  // CREATE | UPDATE | DELETE | AI_ASSIST | RESTORE_VERSION
  metadata      Json?
  createdAt     DateTime @default(now())
  lessonPlan    LessonPlan? @relation(fields: [lessonPlanId], references: [id], onDelete: SetNull)
}
```

---

## 🔌 Rotas da API

### Health
```
GET /health → { status, db, redis, uptime }
```

### Lesson Plans
```
GET    /api/lesson-plans?discipline=Redes&page=1&limit=20
POST   /api/lesson-plans
GET    /api/lesson-plans/:id
PUT    /api/lesson-plans/:id
DELETE /api/lesson-plans/:id
GET    /api/lesson-plans/:id/versions
POST   /api/lesson-plans/:id/restore/:vid
POST   /api/lesson-plans/:id/duplicate
GET    /api/lesson-plans/:id/export/pdf
GET    /api/lesson-plans/:id/export/ical
```

### Smart Assist
```
POST /api/ai/recommend
GET  /api/ai/recommend/stream (SSE)
```

### Analytics
```
GET /api/analytics/summary
```

### Documentation
```
GET /api/docs (Swagger UI)
```

---

## 🚢 Deployment

### Docker Production Build

```bash
# Build images
docker-compose build

# Verificar imagem final
docker images | grep lesson-plan

# Levantar em produção
docker-compose up -d
```

### CI/CD com GitHub Actions

- **ci.yml**: Lint + Jest + Build a cada push/PR
- **cypress.yml**: E2E tests em PRs para `main`

---

## 📝 Variáveis de Ambiente

### Backend (.env)

```env
# Obrigatório
DATABASE_URL=postgresql://user:pass@postgres:5432/lessonplans
REDIS_URL=redis://redis:6379
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Opcional (defaults fornecidos)
PORT=3000
NODE_ENV=production
AI_CACHE_TTL_SECONDS=86400
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
```

---

## 🎨 Recursos UI Especiais

### Dark Mode
- Toggle com preferência do SO
- Persistência em localStorage
- Componentes com TailwindCSS dark mode

### Streaming SSE (Smart Assist)
- Tokens aparecem em tempo real (como ChatGPT)
- Loading indicator elegante
- Badge "Resposta em Cache" se hit no Redis

### Skeleton Loaders
- Estados de carregamento elegantes
- Substituem spinners genéricos

### Editor Rich-Text
- TipTap para campos Ementa e Conteúdos
- Suporte a bold, italic, listas, etc.

---

## 📊 Exemplo de Uso

### 1. Criar Plano de Aula

```bash
curl -X POST http://localhost:3000/api/lesson-plans \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introdução ao OSPF",
    "objective": "Compreender conceitos de OSPF",
    "summary": "Aula sobre roteamento...",
    "scheduledAt": "2026-05-20T10:00:00Z",
    "discipline": "Redes",
    "contents": "Conteúdo...",
    "resources": "Livro...",
    "tags": ["roteamento", "ospf"]
  }'
```

### 2. Obter Recomendações de IA

```bash
curl -X POST http://localhost:3000/api/ai/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introdução ao OSPF",
    "discipline": "Redes",
    "summary": "Aula sobre roteamento..."
  }'
```

### 3. Streaming SSE

```javascript
const source = new EventSource('/api/ai/recommend/stream?title=...&discipline=...&summary=...');
source.onmessage = (event) => {
  console.log('Token:', event.data);
};
```

---

## 🐛 Troubleshooting

### PostgreSQL não conecta
```bash
# Verifique se porta 5432 está livre
lsof -i :5432

# Ou use docker ps para ver containers
docker ps
```

### Redis connection refused
```bash
# Reinicie Redis
docker-compose down redis
docker-compose up redis
```

### Hot-reload não funciona (Frontend)
```bash
# Use docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up
```

---

## 📚 Referências

- [Fastify Docs](https://www.fastify.io/)
- [Prisma ORM](https://www.prisma.io/)
- [Claude API](https://docs.anthropic.com/)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Query](https://tanstack.com/query)
- [Cypress E2E](https://docs.cypress.io/)
- [TailwindCSS](https://tailwindcss.com/)

---

## 📄 Licença

MIT

---

## 👥 Contribuições

Contribuições são bem-vindas! Abra uma issue ou PR.

---

**Desenvolvido com ❤️ para docentes do século XXI**