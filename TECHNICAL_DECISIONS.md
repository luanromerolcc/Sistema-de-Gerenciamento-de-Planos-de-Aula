# Decisões Técnicas e Raciocínio de Engenharia

Este documento registra as escolhas de tecnologia e arquitetura feitas neste projeto, com o raciocínio por trás de cada decisão e os tradeoffs considerados. Escrevo isso não como justificativa, mas como extensão natural do código — boas decisões deveriam ser explicáveis.

---

## Backend

### Fastify em vez de Express

Express seria a escolha óbvia e segura. Escolhi Fastify por razões objetivas:

- **Performance**: Fastify processa ~77k requests/s contra ~45k do Express em benchmarks oficiais. Para um endpoint de streaming SSE com múltiplas conexões simultâneas, isso importa.
- **Validação nativa com JSON Schema**: Fastify valida e serializa schemas automaticamente, acelerando responses e evitando vazamento de campos internos.
- **Pino integrado**: logger estruturado de altíssima performance já embutido, sem dependência adicional.
- **Plugins com encapsulamento**: o sistema de plugins do Fastify garante que contextos não vazem entre módulos.

O tradeoff real é o ecossistema menor de middlewares. Nenhum middleware de terceiros que precisei estava ausente, então o risco não se materializou.

### Prisma como ORM

Avaliei três opções: Prisma, TypeORM e Knex (query builder).

TypeORM tem um histórico de bugs sutis em queries complexas e sua API de decorators mistura responsabilidades de forma que complica testes. Knex exige SQL manual para operações complexas.

Prisma ganhou pelos seguintes motivos concretos:
- **Arrays PostgreSQL nativos**: o campo `tags String[]` é tratado como array real no banco, sem serialização manual.
- **`tsvector` como tipo não suportado**: Prisma expõe tipos não nativos via `Unsupported()`, permitindo usar o campo para full-text search sem abrir mão do ORM.
- **Migrations geradas automaticamente**: o schema é a fonte de verdade. Não existe risco de schema no banco divergir do modelo no código.
- **Prisma Studio**: UI web gratuita para inspecionar dados em desenvolvimento, sem instalar pgAdmin.

### Full-text Search com tsvector

O desafio pedia "buscar por título". Implementei com `tsvector` indexado em vez de `LIKE '%termo%'` por duas razões:

1. `ILIKE '%termo%'` não usa índices — faz varredura completa da tabela. Com 10k planos isso começa a doer.
2. `tsvector` suporta busca em múltiplos campos simultaneamente (título + disciplina + tags), ranking por relevância via `ts_rank`, e stemming nativo do PostgreSQL.

A query fica assim:
```sql
SELECT *, ts_rank(search_vector, query) AS rank
FROM lesson_plans, to_tsquery('portuguese', $1) query
WHERE search_vector @@ query
ORDER BY rank DESC
```

O índice GIN no campo `searchVector` garante que essa busca seja O(log n) independente do volume.

### Redis para cache da IA

Chamadas à API de LLM têm dois problemas: latência (~1-2s) e custo. Para um assistente pedagógico, usuários frequentemente fazem a mesma pergunta com os mesmos inputs (mesma disciplina, títulos similares).

A solução foi cachear respostas usando um hash MD5 de `title + discipline + summary` como chave. TTL de 24h por padrão, configurável via `AI_CACHE_TTL_SECONDS`.

Resultado prático: segunda requisição idêntica retorna em <5ms com badge "Resposta em Cache" na UI. O log registra `cached: true` para observabilidade.

O retry strategy do cliente Redis usa backoff exponencial com máximo de 3 tentativas, evitando que uma instância Redis reiniciando derrube o backend.

### SSE em vez de WebSocket para streaming

O streaming da IA é unidirecional: servidor → cliente. WebSocket é bidirecional por natureza — adiciona handshake, estado de conexão e complexidade sem benefício aqui.

Server-Sent Events é o protocolo correto para este caso:
- HTTP padrão, sem upgrade de protocolo
- Reconexão automática pelo browser
- Funciona através de proxies e load balancers sem configuração especial
- API nativa no browser com `EventSource`

```javascript
// Frontend: sem biblioteca, API nativa
const source = new EventSource(`/api/ai/recommend/stream?title=...`)
source.addEventListener('done', (e) => fillForm(JSON.parse(e.data)))
source.addEventListener('error', () => source.close())
```

### Versionamento automático de planos

Este recurso não estava no requisito e foi uma decisão deliberada.

O raciocínio: planos de aula são documentos pedagógicos que evoluem ao longo do semestre. Um docente que edita um plano e percebe que perdeu a versão anterior vai ter um problema real. O custo de implementar snapshots antes de cada UPDATE é baixo (uma `LessonPlanVersion` por edição), e o benefício para o usuário final é alto.

Implementação: o `lessonPlan.service.js` cria a versão dentro da mesma transação Prisma que executa o UPDATE. Se a criação do snapshot falhar, o UPDATE não acontece — atomicidade garantida.

### Audit Log

Registrar `AI_ASSIST` no audit log além das operações CRUD surgiu de uma pergunta simples: *como o administrador saberia quais planos foram gerados com assistência de IA versus escritos manualmente?*

O campo `metadata` em JSON permite armazenar contexto específico de cada operação (tokens usados, modelo de IA, versão restaurada) sem alterar o schema para cada novo tipo de evento.

---

## Frontend

### Vite em vez de Create React App

CRA está em modo de manutenção desde 2023. Vite tem HMR instantâneo (< 100ms), build 10x mais rápido via esbuild, e suporte nativo a ESM. Não há justificativa técnica para usar CRA em 2025.

### TanStack Query para data fetching

A alternativa natural seria SWR, mas TanStack Query v5 oferece:
- **Mutations com invalidação automática de cache**: ao criar/editar um plano, a listagem é refetchada automaticamente.
- **`staleTime` configurável**: listagem fica em cache por 5 minutos antes de refetch, reduzindo requests desnecessários.
- **Estado de loading/error por operação**: cada mutation tem seu próprio estado, permitindo feedback granular na UI.
- **Deduplicação automática**: múltiplos componentes pedindo o mesmo recurso fazem apenas uma requisição.

### Zustand para estado de filtros

Redux seria over-engineering para gerenciar quatro campos de filtro (disciplina, tags, busca, período). Zustand oferece:
- Store criado em ~10 linhas de código
- Sem actions, reducers ou providers
- Acesso direto ao estado e mutações: `const { discipline, setDiscipline } = useFilterStore()`

O estado de filtros foi escolhido como global (Zustand) e não local (useState) especificamente porque o FilterBar e a LessonPlansPage são componentes irmãos — precisam compartilhar estado sem prop drilling.

### shadcn/ui em vez de MUI ou Chakra

MUI e Chakra são caixas-pretas: você importa o componente e recebe HTML e CSS que não controla. Customizar além do tema exige `sx` props ou chakra system que aumentam o bundle e travam o desenvolvedor.

shadcn/ui funciona de forma diferente: os componentes são copiados para o projeto como código-fonte. Você tem controle total sobre cada componente, pode modificar, remover features desnecessárias e o bundle só inclui o que você usa. Dark mode é uma classe CSS, não uma prop de tema.

O tradeoff é que atualizações de componentes precisam ser feitas manualmente (não é uma dependência semântica). Para um projeto onde a UI precisa de identidade própria, vale a pena.

### React Hook Form com Zod

O mesmo schema Zod usado no backend para validação de requests é reutilizável no frontend com `@hookform/resolvers/zod`. Isso garante que as regras de validação sejam idênticas em ambos os lados sem duplicação de lógica.

Validação é executada no cliente antes do request e no servidor antes de tocar o banco. Dois pontos de proteção com um schema.

---

## Infraestrutura

### Docker multi-stage

O Dockerfile do backend tem dois estágios:

1. **Builder**: instala todas as dependências (incluindo devDependencies e Prisma CLI), gera o Prisma Client.
2. **Runtime**: parte de `node:20-alpine` limpo, copia apenas o necessário, executa `npm prune --omit=dev`.

Resultado: imagem de produção ~120MB em vez de >800MB com node_modules completo. Menos superfície de ataque, pull mais rápido em deploys.

Para o frontend, o estágio de build compila o React com Vite e o estágio final serve o `dist/` com Nginx, eliminando Node.js da imagem de produção.

### PostgreSQL em vez de SQLite

SQLite seria suficiente para o desafio e teria simplificado o setup. Escolhi PostgreSQL pelos seguintes motivos práticos:

- **tsvector**: full-text search nativo só existe no PostgreSQL.
- **Arrays**: `tags String[]` como tipo nativo, não uma coluna JSON serializada.
- **Produção realista**: o projeto usa o mesmo banco em desenvolvimento e produção. SQLite em dev + PostgreSQL em prod é uma fonte clássica de bugs silenciosos.

O custo de setup é zero com docker-compose — o banco sobe automaticamente com o projeto.

### Dois pipelines de CI separados

**ci.yml** (todo push): lint + Jest + build do frontend. Rápido (< 2 minutos), feedback imediato para o desenvolvedor.

**cypress.yml** (PRs para main): sobe a stack completa com docker-compose, executa os testes E2E contra serviços reais. Mais lento (~5 minutos), mas valida a integração real antes de cada merge.

A separação evita que todo push espere 5 minutos de CI para feedback.

### Groq API em vez de OpenAI ou Anthropic

Três critérios orientaram essa escolha:

1. **Custo zero**: Groq tem um tier gratuito generoso, adequado para um desafio técnico que será avaliado por poucas pessoas.
2. **Latência**: Groq usa hardware proprietário (LPU) que processa tokens ~10x mais rápido que GPUs padrão. O streaming SSE fica mais fluido.
3. **Compatibilidade de API**: o endpoint da Groq é compatível com OpenAI API. Trocar para OpenAI ou Anthropic exige mudar apenas a inicialização do client e a variável de ambiente — o restante do código permanece igual.

---

## O que ficou de fora e por quê

### Autenticação

JWT com refresh tokens ou OAuth2 seria o próximo passo obrigatório antes de produção. Ficou fora do escopo do desafio intencionalmente — adicionar auth sem um modelo de usuários definido seria adicionar complexidade sem clareza de requisito. O README documenta essa decisão explicitamente.

### TypeScript

O projeto está em JavaScript com validação Zod. Para um time de 2-3 pessoas mantendo este código, a produtividade com JS + Zod é comparável ao TS. O benefício real do TypeScript aparece em times maiores ou quando o projeto atinge complexidade que o IntelliSense precisa guiar o desenvolvedor.

Se este projeto fosse para produção, a migração para TypeScript seria feita incrementalmente — começando pelo backend, que é onde bugs de tipo são mais silenciosos.

### Testes unitários do service layer

A cobertura atual foca em testes de integração via HTTP (Jest + Supertest). Testes unitários do `lessonPlan.service.js` com mocks de Prisma estão ausentes. O raciocínio foi priorizar testes que validam o comportamento observável pelo cliente (a API) em vez de detalhes de implementação interna.

Isso não significa que testes unitários de serviço são desnecessários — significa que, com tempo limitado, integração tem mais ROI para validar que o sistema funciona de ponta a ponta.

---

## Retrospectiva honesta

**O que funcionou bem:**
- A arquitetura em camadas (`routes → controller → service → repository`) pagou dividendos na hora de adicionar funcionalidades. Adicionar o sistema de versões não exigiu tocar nas rotas ou controllers.
- O cache Redis com hash do prompt foi uma decisão simples com impacto alto na UX — a segunda chamada idêntica retorna em milissegundos.
- Separar os dois pipelines de CI foi a decisão certa. Poder fazer push sem esperar os testes E2E mudou o ritmo de desenvolvimento.

**O que eu faria diferente:**
- Começaria com TypeScript desde o início. Migrar depois é mais trabalhoso que começar com ele.
- Adicionaria mocks de Prisma para testes unitários do service layer mais cedo — ficaram para o final e acabaram não sendo implementados com a cobertura ideal.
- Documentaria a escolha da Groq API no README desde o início, evitando a inconsistência que existiu entre o `.env.example` (GROQ_API_KEY) e o README original (que dizia Anthropic).
