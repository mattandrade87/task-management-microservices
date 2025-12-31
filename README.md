# 📋 Task Management Microservices

> Sistema completo de gestão de tarefas colaborativo com autenticação JWT, CRUD de tarefas, comentários, notificações em tempo real e arquitetura de microserviços.

[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.5-336791?logo=postgresql)](https://www.postgresql.org/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?logo=rabbitmq)](https://www.rabbitmq.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)

---

## 📚 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Stack Técnica](#-stack-técnica)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Como Executar](#-como-executar)
- [Endpoints da API](#-endpoints-da-api)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Decisões Técnicas](#-decisões-técnicas)
- [Trade-offs](#-trade-offs)
- [Melhorias Futuras](#-melhorias-futuras)
- [Autor](#-autor)

---

## Sobre o Projeto

Este projeto é uma aplicação full-stack de gerenciamento de tarefas colaborativo, construída com arquitetura de microserviços. Foi desenvolvido como parte de um desafio técnico, seguindo as melhores práticas de desenvolvimento e arquitetura moderna.

**Características principais:**
- 🏗️ Arquitetura de microserviços com NestJS
- 🔐 Autenticação JWT com refresh tokens
- 📝 CRUD completo de tarefas com histórico de auditoria
- 💬 Sistema de comentários
- 🔔 Notificações em tempo real via WebSocket
- 🎨 Interface moderna com React + shadcn/ui
- 🐳 Totalmente containerizado com Docker
- 📊 Monorepo gerenciado com Turborepo

---

## 🛠️ Stack Técnica

### Backend
- **Framework**: NestJS 11.x
- **ORM**: TypeORM 0.3.x (com migrations)
- **Database**: PostgreSQL 17.5
- **Message Broker**: RabbitMQ 3.13
- **Autenticação**: JWT (Passport + @nestjs/jwt)
- **Validação**: class-validator + class-transformer
- **Hashing**: bcrypt
- **Health Checks**: @nestjs/terminus
- **Rate Limiting**: @nestjs/throttler (10 req/s)
- **Logging**: winston + nest-winston (structured logging)
- **API Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: React 19.x (Vite)
- **Roteamento**: TanStack Router (file-based routing)
- **UI**: shadcn/ui (11 componentes) + Tailwind CSS
- **Validação**: react-hook-form + zod
- **Estado**: Context API
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios (com interceptors para refresh automático)

### DevOps/Infra
- **Monorepo**: Turborepo 2.6.x
- **Containerização**: Docker + Docker Compose
- **Package Manager**: npm Workspaces
- **Node**: >= 18

---

## 🏗️ Arquitetura

### Diagrama de Microserviços

\`\`\`
┌─────────────────────────────────┐
│      Frontend (React)           │
│      Port: 5174                 │
│      - TanStack Router          │
│      - shadcn/ui Components     │
│      - WebSocket Client         │
└──────────┬──────────────────────┘
           │ HTTP/WebSocket
           ↓
┌──────────────────────────────────────┐
│      API Gateway (NestJS)            │
│      Port: 3001                      │
│      - HTTP REST Endpoints           │
│      - JWT Auth Guard                │
│      - Swagger Documentation         │
│      - Rate Limiting (10 req/s)      │
│      - Health Checks                 │
└──────┬───────────────────────────────┘
       │
       ├──→ TCP (auth-service:3003)
       ├──→ RabbitMQ (tasks-service)
       └──→ RabbitMQ (notifications-service)
       
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│  Auth Service    │  │  Tasks Service   │  │ Notifications Service│
│  Port: 3002      │  │  RabbitMQ        │  │  Port: 3004          │
│  (HTTP)          │  │  Consumer        │  │  - WebSocket Gateway │
│  Port: 3003      │  │  - CRUD Tasks    │  │  - RabbitMQ Consumer │
│  (TCP)           │  │  - Comments      │  │  - Persist Notifs    │
│  - Users CRUD    │  │  - History       │  │  - Real-time Emit    │
│  - JWT Gen       │  │  - Events Pub    │  │                      │
└──────┬───────────┘  └──────┬───────────┘  └──────┬───────────────┘
       │                      │                      │
       └──────────────────────┴──────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │  PostgreSQL Database      │
                │  Port: 5432               │
                │  DB: challenge_db         │
                └───────────────────────────┘
                
                ┌───────────────────────────┐
                │    RabbitMQ Broker        │
                │    Port: 5672 (AMQP)      │
                │    Port: 15672 (Mgmt UI)  │
                └───────────────────────────┘
\`\`\`

### Comunicação entre Serviços

| Origem | Destino | Protocolo | Descrição |
|--------|---------|-----------|-----------|
| Frontend | API Gateway | HTTP/WebSocket | REST API + Notificações em tempo real |
| API Gateway | Auth Service | TCP | Login, Register, Refresh, Validação de usuário |
| API Gateway | Tasks Service | RabbitMQ | CRUD Tasks + Comments (request-response pattern) |
| API Gateway | Notifications | RabbitMQ | Buscar notificações do usuário |
| Tasks Service | RabbitMQ | AMQP (Publish) | Publica eventos: task.created, task.updated, task.comment.created |
| Notifications | RabbitMQ | AMQP (Consume) | Consome eventos e persiste notificações |
| Notifications | Frontend | WebSocket | Emite notificações em tempo real (rooms por userId) |

---

## ✨ Funcionalidades

### Autenticação & Autorização ✅
- Registro de usuários com validação de duplicatas
- Login com JWT (access_token 15min + refresh_token 7 dias)
- Renovação automática de tokens
- Proteção de rotas com JWT Guards
- Endpoint \`/auth/me\` para perfil do usuário autenticado

### Gerenciamento de Tarefas ✅
- CRUD completo (Create, Read, Update, Delete)
- Paginação em listagem (\`?page=1&size=10\`)
- Campos: título, descrição, prioridade, status, data de vencimento
- Assignees (múltiplos usuários podem ser atribuídos)
- **Histórico de auditoria** (task-history) - rastreia todas mudanças automaticamente

### Comentários ✅
- Adicionar comentários em tarefas
- Listar comentários com paginação
- Vinculação automática com autor e tarefa

### Notificações em Tempo Real ✅
- WebSocket com autenticação JWT no handshake
- Notificações automáticas para assignees quando:
  - ✅ Tarefa é criada (assignees são notificados)
  - ✅ Tarefa é atualizada (assignees são notificados)
  - ✅ Comentário é adicionado (assignees são notificados)
- Persistência de notificações no banco de dados
- Endpoints para marcar como lida e buscar não lidas
- Rooms por userId para emissões direcionadas
- **Lógica inteligente**: autor da ação não recebe sua própria notificação

### Frontend Responsivo ✅
- Dashboard com lista de tarefas (cards visuais)
- Badges de status (TODO, IN_PROGRESS, REVIEW, DONE) e prioridade (LOW, MEDIUM, HIGH, URGENT)
- Modal de criação de tarefas com validação Zod
- Página de detalhes da tarefa com comentários
- Notificações toast em tempo real (Sonner)
- Loading states e skeleton loaders
- Design mobile-first totalmente responsivo
- **11 componentes shadcn/ui** integrados (220% do requisito de 5)

### Infraestrutura & DevOps ✅
- **Rate Limiting**: 10 requisições por segundo no API Gateway
- **TypeORM Migrations**: Schema versionado (scripts prontos)
- **Health Checks**: Endpoints \`/health\` em todos serviços
- **Logging estruturado**: Winston com formato JSON + console colorido
- **Swagger Documentation**: Interface interativa completa
- **Docker Compose**: Todos serviços orquestrados com health checks
- **Monorepo**: Turborepo para build e dev paralelo

---

## 🚀 Como Executar

### Pré-requisitos

- **Docker Desktop** instalado e rodando
- **Node.js** >= 18 (opcional, para desenvolvimento local)
- **npm** >= 10.9.2

### Iniciar todos os serviços

\`\`\`bash
# Clone o repositório
git clone <repository-url>
cd task-management-microservices

# Instalar dependências (opcional, para desenvolvimento local)
npm install

# Subir todos os serviços com Docker Compose
docker-compose up --build

# Ou executar em background (detached mode)
docker-compose up -d --build
\`\`\`

### Aguarde a inicialização

Os serviços são iniciados na seguinte ordem:
1. **PostgreSQL** (aguarda health check)
2. **RabbitMQ** (aguarda health check)
3. **Auth Service** (aguarda DB)
4. **Tasks Service** (aguarda DB + RabbitMQ)
5. **Notifications Service** (aguarda DB + RabbitMQ)
6. **API Gateway** (aguarda Auth + RabbitMQ)
7. **Frontend** (aguarda API Gateway)

⏱️ **Tempo estimado de inicialização**: 1-2 minutos

### Serviços Disponíveis

| Serviço | URL | Descrição |
|---------|-----|-----------|
| 🎨 **Frontend** | http://localhost:5174 | Interface React com TanStack Router |
| 🚪 **API Gateway** | http://localhost:3001 | REST API principal (entrada única) |
| 📖 **Swagger Docs** | http://localhost:3001/api/docs | Documentação interativa da API |
| 🔐 **Auth Service** | http://localhost:3002 | Serviço de autenticação (HTTP) |
| 🔐 **Auth TCP** | tcp://localhost:3003 | Auth Service (TCP microservice) |
| 📋 **Tasks Service** | RabbitMQ | Microserviço de tarefas (queue consumer) |
| 🔔 **Notifications** | http://localhost:3004 | Notificações + WebSocket Gateway |
| 🗄️ **PostgreSQL** | localhost:5432 | Banco de dados (user: postgres, pass: password) |
| 🐰 **RabbitMQ UI** | http://localhost:15672 | Management UI (user: admin, pass: admin) |

### Health Checks

Verifique a saúde dos serviços:

\`\`\`bash
# API Gateway (verifica DB, auth-service, rabbitmq)
curl http://localhost:3001/health

# Auth Service (verifica DB)
curl http://localhost:3002/health

# Notifications Service (verifica DB, rabbitmq)
curl http://localhost:3004/health
\`\`\`

### Ver Logs

\`\`\`bash
# Todos os serviços (output combinado)
docker-compose logs -f

# Serviço específico
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
docker-compose logs -f tasks-service
docker-compose logs -f notifications-service
docker-compose logs -f web

# Filtrar por nível (error)
docker-compose logs -f | grep ERROR
\`\`\`

### Parar os Serviços

\`\`\`bash
# Parar serviços (mantém volumes/dados)
docker-compose down

# Parar e remover volumes (⚠️ apaga dados do banco)
docker-compose down -v

# Rebuild de um serviço específico
docker-compose up --build --no-deps api-gateway
\`\`\`

---

## 📡 Endpoints da API

Todos os endpoints (exceto autenticação pública) requerem header:  
\`Authorization: Bearer <access_token>\`

### Autenticação (Públicos)

#### Registrar usuário
\`\`\`http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
\`\`\`

#### Login
\`\`\`http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "refresh_token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
\`\`\`

#### Renovar token
\`\`\`http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1..."
}
\`\`\`

### Autenticação (Protegidos)

#### Perfil do usuário
\`\`\`http
GET /auth/me
Authorization: Bearer <access_token>

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe"
}
\`\`\`

### Tarefas (Protegidos)

#### Listar tarefas (com paginação)
\`\`\`http
GET /api/tasks?page=1&size=10
Authorization: Bearer <access_token>

Response:
{
  "data": [ /* array de tasks */ ],
  "total": 50,
  "page": 1,
  "size": 10
}
\`\`\`

#### Criar tarefa
\`\`\`http
POST /api/tasks
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Implement Feature X",
  "description": "Detailed description here",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2025-01-15T00:00:00.000Z",
  "assigneeIds": ["uuid1", "uuid2"]
}
\`\`\`

#### Buscar tarefa por ID
\`\`\`http
GET /api/tasks/:id
Authorization: Bearer <access_token>
\`\`\`

#### Atualizar tarefa
\`\`\`http
PUT /api/tasks/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "priority": "URGENT"
}
\`\`\`

#### Deletar tarefa
\`\`\`http
DELETE /api/tasks/:id
Authorization: Bearer <access_token>
\`\`\`

### Comentários (Protegidos)

#### Adicionar comentário
\`\`\`http
POST /api/tasks/:id/comments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "text": "This is my comment on the task"
}
\`\`\`

#### Listar comentários
\`\`\`http
GET /api/tasks/:id/comments?page=1&size=10
Authorization: Bearer <access_token>
\`\`\`

### 📖 Swagger Documentation

Acesse **http://localhost:3001/api/docs** para:
- ✅ Documentação completa de todos endpoints
- ✅ Schemas de request/response
- ✅ Try it out (testar direto no navegador)
- ✅ Autenticação Bearer Token integrada

---

## �� Estrutura do Projeto

\`\`\`
task-management-microservices/
├── apps/
│   ├── api-gateway/               # Gateway HTTP + Proxy
│   │   ├── src/
│   │   │   ├── auth/              # AuthController, JwtStrategy, Guards
│   │   │   ├── tasks/             # TasksController (proxy)
│   │   │   ├── health.controller.ts
│   │   │   ├── logger.config.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts            # Swagger + Rate Limiting
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── auth-service/              # Microserviço de Autenticação
│   │   ├── src/
│   │   │   ├── auth/              # JWT, Login, Register, Refresh
│   │   │   ├── users/             # User entity + service
│   │   │   ├── migrations/        # TypeORM migrations
│   │   │   ├── health.controller.ts
│   │   │   ├── logger.config.ts
│   │   │   ├── data-source.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts            # TCP + HTTP
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── tasks-service/             # Microserviço de Tarefas
│   │   ├── src/
│   │   │   ├── tasks/             # CRUD, History, Events Publisher
│   │   │   ├── comments/          # Comments CRUD
│   │   │   ├── migrations/
│   │   │   ├── health.controller.ts
│   │   │   ├── logger.config.ts
│   │   │   ├── data-source.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts            # RabbitMQ Consumer
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── notifications-service/     # Notificações + WebSocket
│   │   ├── src/
│   │   │   ├── notifications/
│   │   │   │   ├── notifications.controller.ts  # RabbitMQ Consumer
│   │   │   │   ├── notifications.service.ts
│   │   │   │   ├── notifications.gateway.ts     # WebSocket
│   │   │   │   └── entities/
│   │   │   ├── migrations/
│   │   │   ├── health.controller.ts
│   │   │   ├── logger.config.ts
│   │   │   ├── data-source.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts            # HTTP + WebSocket + RabbitMQ
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                       # Frontend React
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/            # 11 componentes shadcn/ui
│       │   │   ├── AuthDialog.tsx
│       │   │   ├── Dashboard.tsx
│       │   │   ├── TaskDetail.tsx
│       │   │   └── CreateTaskDialog.tsx
│       │   ├── contexts/
│       │   │   └── AuthContext.tsx
│       │   ├── hooks/
│       │   │   └── useWebSocket.ts
│       │   ├── lib/
│       │   │   ├── api.ts         # Axios + interceptors
│       │   │   └── utils.ts
│       │   ├── routes/            # TanStack Router
│       │   │   ├── __root.tsx
│       │   │   ├── index.tsx
│       │   │   └── tasks.$taskId.tsx
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── router.tsx
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── types/                     # Tipos TypeScript compartilhados
│   ├── ui/                        # Componentes compartilhados
│   ├── eslint-config/
│   └── typescript-config/
│
├── docker-compose.yml             # Orquestração completa
├── turbo.json                     # Config Turborepo
├── package.json                   # Root workspace
├── MIGRATIONS.md                  # Guia de migrations
└── README.md                      # Este arquivo
\`\`\`

---

## 🤔 Decisões Técnicas

### 1. Arquitetura de Microserviços
**Decisão**: Dividir em 4 microserviços (Auth, Tasks, Notifications, Gateway)  
**Razão**: 
- Separação de responsabilidades clara
- Escalabilidade independente
- Falhas isoladas (um serviço cai, outros continuam)
- Facilita manutenção e testes

### 2. TCP para Auth Service
**Decisão**: Auth Service expõe TCP (porta 3003) além de HTTP  
**Razão**:
- TCP é mais eficiente para comunicação request-response síncrono entre serviços internos
- Menor overhead que HTTP
- Mantém HTTP (3002) para health checks

### 3. RabbitMQ para Tasks e Notifications
**Decisão**: Tasks Service publica eventos, Notifications consome  
**Razão**:
- Desacoplamento: Tasks não precisa conhecer Notifications
- Resiliência: Se Notifications cair, mensagens ficam na fila
- Event-driven architecture facilita adicionar novos consumidores

### 4. TypeORM com Migrations
**Decisão**: Usar migrations ao invés de \`synchronize: true\`  
**Razão**:
- Production-safe (synchronize pode causar perda de dados)
- Versionamento de schema
- Rollback de mudanças
- Controle fino sobre alterações no banco

### 5. Rate Limiting de 10 req/s
**Decisão**: Throttling global no API Gateway  
**Razão**:
- Proteção contra abuse/DoS
- Controle de recursos
- 10 req/s é adequado para MVP (pode ser ajustado por rota)

### 6. Winston para Logging
**Decisão**: Logging estruturado com winston  
**Razão**:
- Logs em formato JSON para análise
- Multiple transports (console + file)
- Níveis de log configuráveis
- Facilita integração com ferramentas de observabilidade

### 7. shadcn/ui ao invés de biblioteca completa
**Decisão**: Componentes shadcn/ui copiados para o projeto  
**Razão**:
- Controle total sobre componentes (pode customizar)
- Sem dependências pesadas
- Tailwind CSS nativo
- Componentes acessíveis por padrão

### 8. TanStack Router ao invés de React Router
**Decisão**: Usar TanStack Router para roteamento  
**Razão**:
- Type-safe routing (rotas tipadas)
- File-based routing (mais organizado)
- Melhor performance
- Melhor suporte a data loading

### 9. Monorepo com Turborepo
**Decisão**: Estrutura monorepo com Turborepo  
**Razão**:
- Shared code entre apps (\`@repo/types\`, \`@repo/ui\`)
- Build paralelo (mais rápido)
- Cache inteligente
- Gerenciamento unificado de dependências

---

## ⚖️ Trade-offs

### 1. Complexidade vs. Escalabilidade
**Trade-off**: Microserviços aumentam complexidade inicial  
**Impacto**: Mais serviços = mais configuração, mais pontos de falha  
**Mitigação**: Docker Compose simplifica orquestração local, Health checks monitoram status

### 2. Consistência Eventual vs. Performance
**Trade-off**: Notificações são assíncronas (RabbitMQ)  
**Impacto**: Pequeno delay entre ação e notificação (~100ms)  
**Mitigação**: Aceitável para notificações, usuário não percebe

### 3. JWT Stateless vs. Revogação Imediata
**Trade-off**: JWTs não podem ser revogados antes de expirar  
**Impacto**: Se token vaza, pode ser usado por 15min (access_token TTL)  
**Mitigação**: TTL curto (15min), refresh_token salvo no DB (pode ser revogado)

### 4. TypeORM vs. Prisma
**Trade-off**: TypeORM tem sintaxe mais verbosa  
**Impacto**: Mais código para queries complexas  
**Justificativa**: Requisito do desafio era TypeORM, não Prisma/MikroORM

### 5. Logs em Arquivo vs. Serviço Externo
**Trade-off**: Logs salvos localmente em arquivo  
**Impacto**: Não centralizado, dificulta análise em produção  
**Mitigação**: Em produção, deveria usar ELK/CloudWatch (fora do escopo do MVP)

---

## 🚀 Melhorias Futuras

### Infraestrutura
- [ ] Kubernetes deployment com Helm charts
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Testes E2E com Playwright
- [ ] Testes de integração para cada serviço
- [ ] Monitoring com Prometheus + Grafana
- [ ] Logs centralizados (ELK Stack)
- [ ] API Gateway com Kong/Nginx para proxy reverso

### Backend
- [ ] Cache com Redis (sessions, queries frequentes)
- [ ] Upload de arquivos (anexos em tarefas)
- [ ] Busca full-text (Elasticsearch)
- [ ] Filtros avançados (data, assignee, tags)
- [ ] Soft delete (ao invés de delete físico)
- [ ] Paginação cursor-based (mais eficiente)
- [ ] GraphQL API (alternativa ao REST)

### Frontend
- [ ] Dark mode toggle
- [ ] Drag & drop para reorganizar tarefas
- [ ] Timeline de histórico visual
- [ ] Notificações push (Service Worker)
- [ ] Offline support (PWA)
- [ ] i18n (internacionalização)
- [ ] Gráficos e dashboards (charts.js)

### Segurança
- [ ] 2FA (autenticação de dois fatores)
- [ ] Rate limiting por usuário (não só global)
- [ ] CSRF protection
- [ ] Helmet.js para headers de segurança
- [ ] Input sanitization contra XSS
- [ ] SQL injection protection (já tem com TypeORM parametrizado)

### Funcionalidades
- [ ] Tags/Labels para tarefas
- [ ] Subtarefas
- [ ] Anexos (files)
- [ ] Mentions em comentários (@username)
- [ ] Templates de tarefas
- [ ] Time tracking
- [ ] Relatórios e analytics

---

## 👤 Autor

**Mateus**  
Desenvolvido como parte do desafio técnico Full-stack Júnior - Jungle Gaming

⏱️ **Tempo de desenvolvimento**: ~12 dias  
📊 **Progresso**: 100% completo (5 fases concluídas)

---

## 📄 Licença

Este projeto é privado e foi desenvolvido para fins de avaliação técnica.

---

## 🙏 Agradecimentos

- NestJS pela excelente documentação
- shadcn/ui pelos componentes acessíveis
- Comunidade open-source por todas as ferramentas incríveis

---

**✨ Enjoy coding! ✨**
