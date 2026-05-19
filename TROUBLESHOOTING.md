# 🆘 Troubleshooting & FAQ

## 🐛 Problemas Comuns

### Docker & Containers

#### Erro: "Port 3000 is already in use"
```bash
# Encontre o processo usando a porta
lsof -i :3000

# Mate o processo
kill -9 <PID>

# Ou altere a porta em docker-compose.yml
```

#### Erro: "Cannot connect to Docker daemon"
```bash
# Inicie o Docker Desktop (macOS/Windows)
# Ou inicie o serviço Docker (Linux)
sudo systemctl start docker

# Verifique se está rodando
docker ps
```

#### Containers param após alguns segundos
```bash
# Verifique os logs
docker-compose logs <service-name>

# Inicie em modo verbose
docker-compose up --verbose

# Verifique .env está preenchido corretamente
cat backend/.env
```

---

### Backend

#### "DATABASE_URL is not a valid PostgreSQL connection string"
```bash
# Verifique o formato
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Especialmente:
# - user/pass corretos
# - host correto (localhost vs docker service name)
# - porta 5432 está correta
# - banco 'lessonplans' existe
```

#### "Redis connection refused"
```bash
# Verifique se Redis está rodando
docker ps | grep redis

# Se não estiver, inicie:
docker-compose up redis

# Ou reinicie
docker-compose restart redis
```

#### "Prisma migration failed"
```bash
# Recrie migrations
cd backend
npm run db:migrate:dev

# Se ainda falhar, limpe tudo
docker-compose down -v  # Remove volumes
docker-compose up       # Recrie do zero
npm run db:migrate:dev  # Recrie schema
```

#### "Module not found: groq-sdk"
```bash
# Reinstale dependências
cd backend
rm -rf node_modules package-lock.json
npm install

# Ou direto no container
docker-compose down
docker-compose build --no-cache backend
docker-compose up backend
```

#### "Validation Error: AI_CACHE_TTL_SECONDS is required"
```bash
# .env está faltando variáveis
# Verifique backend/.env contra .env.example
cat backend/.env.example
# Copie todas as variáveis para backend/.env
```

---

### Frontend

#### Vite: "Port 5173 is already in use"
```bash
# Altere a porta em vite.config.js
server: {
  port: 5174,  // Use outra porta
  host: '0.0.0.0'
}

# Ou mate o processo antigo
lsof -i :5173
kill -9 <PID>
```

#### "Cannot GET /plans" (404 depois de refresh)
```bash
# Nginx não está configurado para SPA routing
# Verifique frontend/nginx.conf tem:
location / {
  try_files $uri $uri/ /index.html;
}

# Se em desenvolvimento (npm run dev):
# Vite já trata isso automaticamente
```

#### "Tailwind styles não estão aplicando"
```bash
# Verifique src/index.css tem imports
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

# Reconstrua
npm run build

# Ou limpe cache
rm -rf node_modules/.vite
npm run dev
```

#### "React Hook Form / Zod validation não funciona"
```bash
# Verifique imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Use resolver
const { control } = useForm({
  resolver: zodResolver(schema)
})
```

---

### Testes

#### Testes de integração falham com "Authentication failed" ou timeout

Os testes de integração usam `DATABASE_URL=postgresql://user:pass@postgres:5432/lessonplans` — o hostname `postgres` é um alias de rede interna do Docker que não resolve na máquina host.

```bash
# Solução: execute os testes dentro do container
docker exec backend-dev sh -c \
  "NODE_OPTIONS=--experimental-vm-modules node_modules/.bin/jest --forceExit --detectOpenHandles"

# Se node_modules não estiver no container:
docker exec backend-dev npm install
# e então execute o comando acima novamente
```

Os testes unitários (`tests/unit/`) não precisam de banco e rodam normalmente fora do Docker:
```bash
cd backend
NODE_OPTIONS=--experimental-vm-modules npx jest --testPathPattern=unit --forceExit
```

#### "Jest: Cannot find module"
```bash
# Verifique se está usando ESM
package.json:
"type": "module"

# Configure Jest para ESM
jest.config.js:
"testEnvironment": "node",
"extensionsToTreatAsEsm": [".js"],
"transform": {},
```

#### "Cypress: Timed out waiting for connection"
```bash
# Frontend não está subido
npm run dev

# Ou verifique base URL
cypress.config.js:
e2e: {
  baseUrl: 'http://localhost:5173'
}

# Teste manualmente
curl http://localhost:5173
```

#### "Cypress: Element not found"
```bash
# Seltor incorreto
// Inspecione o elemento
cy.get('[data-testid="lesson-plan-card"]')
// vs
cy.get('.lesson-plan-card')

# Ou elemento não carregou ainda
cy.get('button', { timeout: 5000 }).click()
```

---

## ❓ FAQ

### Geral

**P: Como mudo a porta do backend?**  
R: Edite `backend/.env` → `PORT=4000` e `docker-compose.yml` → `ports: ['4000:3000']`

**P: Como posso usar um banco de dados PostgreSQL externo?**  
R: Altere `DATABASE_URL` em `backend/.env` para apontar para o servidor externo. Remove `postgres` de `docker-compose.yml` se não precisar do container.

**P: Como adiciono autenticação?**  
R: Isso é um upgrade futuro. Recomendado: JWT + middleware de autenticação.

**P: Como faço deploy em produção?**  
R: Use `docker-compose up --build` em um servidor com Docker + docker-compose instalado. Configure um reverse proxy (Nginx) na frente.

---

### Backend

**P: Como adiciono uma nova rota?**  
R:
1. Crie função em `{module}.controller.js`
2. Adicione função em `{module}.service.js`
3. Adicione schema em `{module}.schema.js`
4. Registre rota em `{module}.routes.js`
5. Restart do servidor

**P: Como faço logging estruturado?**  
R: Use `logger` do Pino:
```javascript
import { logger } from '../config/logger.js'
logger.info({ userId: 123, action: 'CREATE' }, 'User created')
logger.error({ err }, 'Error occurred')
```

**P: Como mudo o modelo de IA?**  
R: O projeto usa a API da Groq. Para trocar o modelo, edite `backend/.env`:
```env
GROQ_MODEL=llama-3.3-70b-versatile  # padrão
# Outros modelos disponíveis: mixtral-8x7b-32768, gemma2-9b-it
```
Obtenha ou revogue sua chave em https://console.groq.com

---

### Frontend

**P: Como adiciono um novo componente?**  
R:
1. Crie `src/components/MyComponent.jsx`
2. Exporte função React
3. Importe e use em páginas/componentes

**P: Como uso TanStack Query?**  
R:
```javascript
const { data, isLoading } = useQuery({
  queryKey: ['lessons'],
  queryFn: () => fetch('/api/lesson-plans').then(r => r.json())
})
```

**P: Como implemento dark mode?**  
R: Já está implementado! Clique no botão 🌙 no header. Usa `useTheme()` hook.

**P: Como adiciono uma nova página?**  
R:
1. Crie `src/pages/MyPage.jsx`
2. Importe em `App.jsx`
3. Adicione rota: `<Route path="/mypage" element={<MyPage />} />`

---

### Docker & DevOps

**P: Como rebuild os containers?**  
R: `docker-compose up --build --no-cache`

**P: Como acesso o banco via CLI?**  
R:
```bash
docker-compose exec postgres psql -U user -d lessonplans
# Ou via Prisma Studio
npm run db:studio
```

**P: Como vejo os logs de um container específico?**  
R: `docker-compose logs -f backend` (use `--tail 100` para últimas 100 linhas)

**P: Como faço backup do banco?**  
R:
```bash
docker-compose exec postgres pg_dump -U user lessonplans > backup.sql
# Restore:
docker-compose exec -T postgres psql -U user lessonplans < backup.sql
```

---

### Performance

**P: Como otimizo a performance?**  
R:
- Backend: Adicione índices no banco (`CREATE INDEX`)
- Frontend: Use React.memo, lazy loading
- Geral: Use Redis cache mais agressivamente

**P: Como vejo o tamanho da imagem Docker?**  
R: `docker images | grep lesson-plan`

---

## 📞 Contacto & Suporte

Se tiver problema que não consta aqui:

1. **Verifique os logs**:
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

2. **Busque em Stack Overflow**: Quer o erro específico

3. **Leia documentação oficial**:
   - [Fastify](https://www.fastify.io/)
   - [Prisma](https://www.prisma.io/)
   - [React](https://react.dev/)

4. **Abra uma issue no GitHub** com:
   - Erro exato
   - Passos para reproduzir
   - Outputs de `docker ps`, `.env` (sem secrets)

---

## 🎯 Dicas Produtivas

1. **Use `make` commands**: `make dev-up`, `make test`, `make lint-fix`
2. **Ative prettier auto-save**: No VS Code, `"editor.formatOnSave": true`
3. **Use Prisma Studio**: `npm run db:studio` → UI visual para dados
4. **Inspecione network**: DevTools → Network tab para ver chamadas API
5. **Logs estruturados**: Use Pino, é muito mais poderoso que console.log()

---

**Última atualização**: 19 de maio de 2026
