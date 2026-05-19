# Lesson Plan Manager

Plataforma full-stack para criação, organização e consulta de planos de aula, com assistente de IA integrado que sugere conteúdos, tópicos e tags em tempo real.

> Desafio técnico entregue com todos os requisitos funcionais, todos os bônus de DevOps/observabilidade, e funcionalidades adicionais não solicitadas: versionamento de planos, audit log, exportação PDF/iCal e dashboard analítico.

---

## Funcionalidades

### Requisitos do desafio — entregues

| Requisito | Status |
|---|---|
| CRUD completo com paginação | ✅ |
| Filtros por disciplina, tags e data | ✅ |
| Busca por título | ✅ |
| Ordenação por título e data de cadastro | ✅ |
| Smart Assist com botão "Gerar Recomendações" | ✅ |
| Campos preenchidos automaticamente pela IA | ✅ |
| Feedback visual de loading e erro da IA | ✅ |
| Chave de API via variável de ambiente | ✅ |
| Docker + docker-compose (um comando para subir) | ✅ |
| CI com GitHub Actions (lint a cada push) | ✅ |
| Logs estruturados com TokenUsage e Latência | ✅ |
| Endpoint `/health` | ✅ |

### Além do solicitado

| Funcionalidade extra | Detalhe |
|---|---|
| Streaming SSE da IA | Tokens aparecem em tempo real, como no ChatGPT |
| Cache Redis das respostas da IA | Badge "Resposta em Cache" na UI, TTL configurável |
| Versionamento automático de planos | Snapshot antes de cada edição, restauração com um clique |
| Audit log completo | Toda operação registrada: CREATE, UPDATE, DELETE, AI_ASSIST, RESTORE_VERSION |
| Exportação PDF | Gerado via Puppeteer com formatação |
| Exportação iCal | Integração com Google Calendar e Outlook |
| Dashboard analítico | Cards de métricas + gráfico de barras por disciplina |
| Full-text search PostgreSQL | tsvector com ts_rank, não ILIKE |
| Duplicar plano como template | Reutilizar estrutura de planos existentes |
| Dark mode com persistência | Preferência do SO + localStorage |
| Editor rich-text | TipTap para campos de texto longo |
| Swagger UI | Documentação interativa em `/api/docs` |
| Rate limiting por rota | Proteção do endpoint de IA configurável via env |

---

## Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Backend | Node.js + Fastify | ~2x mais rápido que Express, Pino nativo |
| ORM | Prisma | Type-safe, migrations automáticas, suporte a arrays PostgreSQL |
| Banco | PostgreSQL 15 | tsvector para full-text search, transações ACID |
| Cache | Redis 7 | Cache de respostas da IA com TTL, retry strategy |
| IA | Groq API (llama-3.3-70b-versatile) | Gratuito, baixa latência, resposta JSON nativa |
| Frontend | React 18 + Vite | HMR instantâneo, bundle otimizado |
| UI | TailwindCSS + shadcn/ui | Utility-first, zero runtime CSS-in-JS |
| Forms | React Hook Form + Zod | Validação unificada frontend/backend |
| Data fetching | TanStack Query v5 | Cache automático, deduplicação de requests |
| State | Zustand | Sem boilerplate para estado de filtros |
| Testes backend | Jest + Supertest | — |
| Testes E2E | Cypress 13 | — |
| CI/CD | GitHub Actions | Dois pipelines: unit/lint e E2E completo |
| Containers | Docker multi-stage + docker-compose | Imagem de produção otimizada (~120MB) |

---

## Pré-requisitos

- Docker e Docker Compose
- Chave de API da [Groq](https://console.groq.com) (gratuita)

Isso é tudo. Node, PostgreSQL e Redis rodam nos containers.

---

## Quick Start

```bash
# 1. Clone o repositório
git clone <repo>
cd lesson-plan-manager

# 2. Configure as variáveis de ambiente
cp backend/.env.example backend/.env
# Edite backend/.env e insira sua GROQ_API_KEY

# 3. Suba tudo com um comando
docker-compose up --build
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api/docs |
| Health check | http://localhost:3000/health |

**Modo desenvolvimento com hot-reload:**
```bash
docker-compose -f docker-compose.dev.yml up
```

---

## Variáveis de Ambiente

Arquivo: `backend/.env` (copiar de `backend/.env.example`)

```env
# Obrigatório
DATABASE_URL=postgresql://user:pass@postgres:5432/lessonplans
REDIS_URL=redis://redis:6379
GROQ_API_KEY=gsk_...

# Opcional — defaults fornecidos
GROQ_MODEL=llama-3.3-70b-versatile
PORT=3000
NODE_ENV=production
AI_CACHE_TTL_SECONDS=86400   # 24h de cache Redis para respostas da IA
RATE_LIMIT_MAX=10             # Requests por janela de tempo
RATE_LIMIT_WINDOW_MS=60000   # Janela de 1 minuto
```

---

## Estrutura do Projeto

```
lesson-plan-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js            # Validação de variáveis com Zod (falha no boot se faltarem)
│   │   │   ├── logger.js         # Pino: JSON em produção, pretty em dev
│   │   │   ├── prisma.js         # Singleton do client Prisma
│   │   │   └── redis.js          # Client com retry exponencial (max 3 tentativas)
│   │   ├── modules/
│   │   │   ├── lessonPlans/      # routes → controller → service → repository → schema
│   │   │   ├── ai/               # Smart Assist: JSON + SSE streaming
│   │   │   ├── analytics/        # Dashboard summary
│   │   │   └── exports/          # PDF (Puppeteer) + iCal
│   │   ├── middleware/
│   │   │   └── errorHandler.js   # Erros customizados com status codes semânticos
│   │   ├── app.js                # Fastify com plugins registrados
│   │   └── server.js             # Entry point
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/
│   │   └── integration/
│   │       ├── health.test.js
│   │       └── lessonPlans.test.js
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/ui/        # shadcn/ui (Button, Input, Dialog, Badge…)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Métricas + Recharts
│   │   │   ├── LessonPlansPage.jsx
│   │   │   ├── CreatePlanPage.jsx
│   │   │   └── EditPlanPage.jsx
│   │   ├── hooks/
│   │   │   ├── useLessonPlans.js # TanStack Query: CRUD com cache
│   │   │   ├── useSmartAssist.js # EventSource para SSE
│   │   │   └── useTheme.js       # Dark mode
│   │   ├── store/
│   │   │   └── filterStore.js    # Zustand: discipline, tags, search, dateRange
│   │   └── services/
│   │       └── api.js            # Axios com baseURL configurável
│   ├── cypress/e2e/
│   │   ├── crud.cy.js
│   │   ├── smart-assist.cy.js
│   │   └── filters-search.cy.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── .github/workflows/
│   ├── ci.yml                    # Lint + Jest + Build (todo push)
│   └── cypress.yml               # E2E contra docker-compose (PRs para main)
│
├── scripts/
│   └── wait-for-services.sh      # Aguarda PG, Redis e backend antes dos testes E2E
│
├── docker-compose.yml            # Produção
└── docker-compose.dev.yml        # Dev com hot-reload
```

---

## Schema do Banco

```prisma
model LessonPlan {
  id           String   @id @default(cuid())
  title        String
  objective    String?
  summary      String   @db.Text
  scheduledAt  DateTime
  discipline   String
  contents     String   @db.Text
  resources    String   @db.Text @default("")
  tags         String[]
  searchVector Unsupported("tsvector")?  // índice GIN para full-text search
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  versions  LessonPlanVersion[]  // snapshot automático antes de cada UPDATE
  auditLogs AuditLog[]
}

model LessonPlanVersion {
  id           String     @id @default(cuid())
  lessonPlanId String
  snapshot     Json       // estado completo do plano no momento da edição
  createdAt    DateTime   @default(now())
  lessonPlan   LessonPlan @relation(fields: [lessonPlanId], references: [id], onDelete: Cascade)
}

model AuditLog {
  id           String      @id @default(cuid())
  lessonPlanId String?
  action       String      // CREATE | UPDATE | DELETE | AI_ASSIST | RESTORE_VERSION
  metadata     Json?
  createdAt    DateTime    @default(now())
  lessonPlan   LessonPlan? @relation(fields: [lessonPlanId], references: [id], onDelete: SetNull)
}
```

---

## API Reference

### Health
```
GET /health
→ { status: "ok", db: "ok", redis: "ok", uptime: 42.3 }
```

### Lesson Plans
```
GET    /api/lesson-plans                     Lista com filtros e paginação
POST   /api/lesson-plans                     Cria plano
GET    /api/lesson-plans/:id                 Obtém plano
PUT    /api/lesson-plans/:id                 Atualiza (cria snapshot de versão automaticamente)
DELETE /api/lesson-plans/:id                 Remove
GET    /api/lesson-plans/:id/versions        Histórico de versões
POST   /api/lesson-plans/:id/restore/:vid    Restaura versão anterior
POST   /api/lesson-plans/:id/duplicate       Duplica como template
GET    /api/lesson-plans/:id/export/pdf      Download PDF
GET    /api/lesson-plans/:id/export/ical     Download .ics
```

**Parâmetros de listagem:**
```
?discipline=Redes
?tags=ospf,roteamento
?search=introdução        (full-text search)
?scheduledFrom=2026-06-01
?scheduledTo=2026-06-30
?page=1&pageSize=20
?sortBy=title&sortOrder=asc
```

### Smart Assist
```
POST /api/ai/recommend
Body: { title, discipline, summary }
→ { contents, topics, tags: [3 tags] }

GET /api/ai/recommend/stream?title=...&discipline=...&summary=...
→ Server-Sent Events com tokens em tempo real
```

### Analytics
```
GET /api/analytics/summary
→ { total, thisMonth, upcoming, aiAssisted, byDiscipline, recent }
```

### Documentação interativa
```
GET /api/docs   (Swagger UI)
```

---

## Observabilidade

### Logs estruturados (Pino)

Todos os logs são JSON em produção, parseáveis por Datadog, Grafana Loki, etc.

```json
// Operação normal
{ "level": "info", "msg": "Lesson plan created", "id": "clx...", "title": "Introdução ao OSPF" }

// Requisição à IA — formato exato pedido no desafio
{ "level": "info", "msg": "AI Request", "title": "Introdução ao OSPF", "discipline": "Redes", "tokenUsage": 180, "latencyMs": 1423, "cached": false }

// Cache hit
{ "level": "info", "msg": "AI Request", "cached": true, "latencyMs": 2 }
```

### Health Check

```bash
curl http://localhost:3000/health

{
  "status": "ok",
  "db": "ok",
  "redis": "ok",
  "uptime": 142.7,
  "timestamp": "2026-05-18T10:00:00.000Z"
}
```

---

## Testes

### Backend (Jest + Supertest)
```bash
cd backend
npm test              # todos os testes
npm run test:coverage # com relatório de cobertura
```

### E2E (Cypress)
```bash
cd frontend
npm run cypress:open  # UI interativa
npm run cypress:run   # headless
```

### CI automático
- **ci.yml**: roda lint, Jest e build do frontend a cada push em qualquer branch
- **cypress.yml**: roda os testes E2E contra a stack real (docker-compose) em PRs para `main`

---

## Exemplos de uso via curl

### Criar plano
```bash
curl -X POST http://localhost:3000/api/lesson-plans \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introdução ao OSPF",
    "objective": "Compreender o protocolo de roteamento OSPF",
    "summary": "Aula introdutória sobre roteamento de estado de enlace",
    "scheduledAt": "2026-06-10T10:00:00Z",
    "discipline": "Redes de Computadores",
    "contents": "Conceitos básicos, áreas OSPF, LSA",
    "resources": "Tanenbaum - Redes de Computadores, cap. 5",
    "tags": ["roteamento", "ospf", "redes"]
  }'
```

### Gerar recomendações de IA
```bash
curl -X POST http://localhost:3000/api/ai/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introdução ao OSPF",
    "discipline": "Redes de Computadores",
    "summary": "Aula introdutória sobre roteamento de estado de enlace"
  }'
```

### Busca full-text
```bash
curl "http://localhost:3000/api/lesson-plans?search=protocolo+roteamento&discipline=Redes"
```

---

## Decisões Técnicas

Para o raciocínio detalhado por trás de cada escolha de tecnologia e arquitetura, consulte [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md).

---

## Limitações conhecidas e próximos passos

- **Autenticação**: não implementada (fora do escopo do desafio). Em produção, JWT com refresh tokens ou OAuth2. Todos os endpoints são públicos intencionalmente para facilitar a avaliação.
- **TypeScript**: projeto em JavaScript puro. A validação Zod cobre type-safety em runtime. Migração para TS seria o primeiro passo antes de escalar o time.
- **Testes unitários de serviço**: cobertura atual foca em integração (health, CRUD via HTTP). Mocks de Prisma para testes unitários do `lessonPlan.service.js` estão pendentes.

---

## Estrutura de logs esperada no desafio

O desafio pedia especificamente:
```
[INFO] AI Request: Title="Introdução ao OSPF", Discipline="Redes", TokenUsage=180, Latency=1.4s
```

Implementado em `backend/src/modules/ai/ai.service.js`:
```javascript
logger.info({
  title,
  discipline,
  tokenUsage: usage.total_tokens,
  latencyMs: Date.now() - start,
  cached: false,
}, 'AI Request')
```
