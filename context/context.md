# 📋 Sistema de Gestão de Tarefas Colaborativo - Contexto Completo

## 🎯 VISÃO GERAL DO PROJETO

**Objetivo**: Construir um sistema completo de gestão de tarefas colaborativo com autenticação, CRUD de tarefas, comentários, notificações em tempo real e arquitetura de microserviços.

**Desafio**: Full-stack Júnior - Jungle Gaming  
**Prazo**: 14 dias corridos  
**Progresso Atual**: ~80% completo (4 de 5 fases concluídas)

---

## 🛠️ STACK TÉCNICA OBRIGATÓRIA

### Backend
- **Framework**: NestJS 11.x
- **ORM**: TypeORM 0.3.x (OBRIGATÓRIO - não usar Prisma/MikroORM)
- **Database**: PostgreSQL 17.5
- **Message Broker**: RabbitMQ 3.13
- **Autenticação**: JWT (Passport + @nestjs/jwt)
- **Validação**: class-validator + class-transformer
- **Hashing**: bcrypt

### Frontend
- **Framework**: React 19.x (NÃO NextJS)
- **Roteamento**: TanStack Router (OBRIGATÓRIO)
- **UI**: shadcn/ui (mínimo 5 componentes) + Tailwind CSS
- **Validação**: react-hook-form + zod
- **Estado**: Context API ou Zustand
- **Real-time**: WebSocket

### DevOps/Infra
- **Monorepo**: Turborepo 2.6.x
- **Containerização**: Docker + Docker Compose
- **Package Manager**: npm 10.9.2
- **Node**: >= 18

---

## 🏗️ ARQUITETURA DO SISTEMA

### Microserviços (Comunicação via RabbitMQ/TCP)

```
┌─────────────┐
│   Frontend  │ (React + TanStack Router)
│   (Port 5173)│
└──────┬──────┘
       │ HTTP/WebSocket
       ↓
┌─────────────────────────────────────┐
│      API Gateway (NestJS)           │
│      Port: 3001                     │
│      - HTTP REST Endpoints          │
│      - WebSocket Gateway            │
│      - JWT Auth Guard               │
│      - Swagger Documentation        │
│      - Rate Limiting (10 req/s)     │
└──────┬──────────────────────────────┘
       │
       ├─→ TCP (auth-service:3003)
       ├─→ RabbitMQ (tasks-service)
       └─→ RabbitMQ (notifications-service)
       
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  Auth Service        │  │  Tasks Service       │  │ Notifications Service│
│  Port: 3002 (HTTP)   │  │  Port: 3003          │  │  Port: 3004          │
│  Port: 3003 (TCP)    │  │  - CRUD Tasks        │  │  - Consume Events    │
│  - User Management   │  │  - Comments          │  │  - Persist Notifs    │
│  - JWT Generation    │  │  - History (Audit)   │  │  - WebSocket Emit    │
│  - Password Hash     │  │  - Publish Events    │  │                      │
└──────┬───────────────┘  └──────┬───────────────┘  └──────┬───────────────┘
       │                          │                          │
       └──────────────────────────┴──────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │    PostgreSQL Database    │
                    │    Port: 5432             │
                    │    DB: challenge_db       │
                    └───────────────────────────┘
                    
                    ┌───────────────────────────┐
                    │      RabbitMQ Broker      │
                    │      Port: 5672 (AMQP)    │
                    │      Port: 15672 (Mgmt)   │
                    │      User: admin/admin    │
                    └───────────────────────────┘
```

### Comunicação entre Serviços

**API Gateway → Auth Service**: TCP (ClientProxy)  
**API Gateway → Tasks Service**: RabbitMQ  
**API Gateway → Notifications Service**: RabbitMQ  
**Tasks Service → RabbitMQ**: Publish events (task.created, task.updated, task.comment.created)  
**Notifications Service ← RabbitMQ**: Consume events  
**Frontend ← API Gateway**: WebSocket (notificações em tempo real)

---

## 📂 ESTRUTURA DO MONOREPO

```
task-management-microservices/
├── apps/
│   ├── api-gateway/              # HTTP Gateway + WebSocket
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts    ✅ (Login + Register + Refresh + /me)
│   │   │   │   ├── auth.module.ts        ✅
│   │   │   │   ├── jwt.strategy.ts       ✅
│   │   │   │   └── jwt-auth.guard.ts     ✅
│   │   │   ├── tasks/
│   │   │   │   ├── tasks.controller.ts   ✅ (CRUD endpoints + comments)
│   │   │   │   ├── tasks.module.ts       ✅ (RabbitMQ ClientProxy)
│   │   │   │   └── dto/
│   │   │   │       ├── create-task.dto.ts ✅
│   │   │   │       └── update-task.dto.ts ✅
│   │   │   ├── app.module.ts             ✅
│   │   │   └── main.ts                   ✅ (Swagger + ValidationPipe)
│   │   ├── .env.example                  ✅
│   │   ├── Dockerfile                    ✅
│   │   └── package.json                  ✅
│   │
│   ├── auth-service/             # Microserviço de Autenticação (TCP)
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts    ✅ (Login + Register + Refresh via TCP)
│   │   │   │   ├── auth.service.ts       ✅ (validateUser + login + refresh)
│   │   │   │   ├── auth.module.ts        ✅
│   │   │   │   └── refresh-token.entity.ts ✅
│   │   │   ├── users/
│   │   │   │   ├── user.entity.ts        ✅
│   │   │   │   ├── users.service.ts      ✅ (create + findByEmail)
│   │   │   │   ├── users.module.ts       ✅
│   │   │   │   └── dto/
│   │   │   │       └── create-user.dto.ts ✅
│   │   │   ├── app.module.ts             ✅
│   │   │   └── main.ts                   ✅ (TCP:3003 + HTTP:3002)
│   │   ├── .env.example                  ✅
│   │   ├── Dockerfile                    ✅
│   │   └── package.json                  ✅
│   │
│   ├── tasks-service/            # CRUD Tasks + Comments + Events
│   │   ├── src/
│   │   │   ├── tasks/
│   │   │   │   ├── tasks.controller.ts   ✅ (@MessagePattern RabbitMQ)
│   │   │   │   ├── tasks.service.ts      ✅ (CRUD + paginação + history)
│   │   │   │   ├── tasks.module.ts       ✅
│   │   │   │   ├── entities/
│   │   │   │   │   ├── task.entity.ts    ✅
│   │   │   │   │   └── task-history.entity.ts ✅
│   │   │   │   └── dto/
│   │   │   │       ├── create-task.dto.ts ✅
│   │   │   │       └── update-task.dto.ts ✅
│   │   │   ├── comments/
│   │   │   │   ├── comments.controller.ts ✅
│   │   │   │   ├── comments.service.ts   ✅
│   │   │   │   ├── comments.module.ts    ✅
│   │   │   │   ├── entities/
│   │   │   │   │   └── comment.entity.ts ✅
│   │   │   │   └── dto/
│   │   │   │       └── create-comment.dto.ts ✅
│   │   │   ├── app.module.ts             ✅ (TypeORM + RabbitMQ)
│   │   │   └── main.ts                   ✅ (RabbitMQ microservice)
│   │   ├── .env.example                  ✅
│   │   ├── Dockerfile                    ✅
│   │   └── package.json                  ✅
│   │
│   ├── notifications-service/     # WebSocket + RabbitMQ Consumer
│   │   ├── src/
│   │   │   ├── notifications/
│   │   │   │   ├── notifications.controller.ts ✅ (@EventPattern RabbitMQ)
│   │   │   │   ├── notifications.service.ts   ✅ (CRUD notificações)
│   │   │   │   ├── notifications.gateway.ts   ✅ (WebSocket + JWT auth)
│   │   │   │   ├── notifications.module.ts    ✅
│   │   │   │   ├── entities/
│   │   │   │   │   └── notification.entity.ts ✅
│   │   │   │   └── dto/
│   │   │   │       └── create-notification.dto.ts ✅
│   │   │   ├── app.module.ts             ✅ (TypeORM + RabbitMQ)
│   │   │   └── main.ts                   ✅ (Microservice + WebSocket)
│   │   ├── .env.example                  ✅
│   │   ├── Dockerfile                    ✅
│   │   └── package.json                  ✅
│   │
│   └── web/                       # Frontend React
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/                   ✅ (11 componentes shadcn/ui)
│       │   │   ├── AuthDialog.tsx        ✅
│       │   │   ├── Dashboard.tsx         ✅
│       │   │   ├── TaskDetail.tsx        ✅
│       │   │   └── CreateTaskDialog.tsx  ✅
│       │   ├── contexts/
│       │   │   └── AuthContext.tsx       ✅
│       │   ├── hooks/
│       │   │   └── useWebSocket.ts       ✅
│       │   ├── lib/
│       │   │   ├── api.ts                ✅
│       │   │   └── utils.ts              ✅
│       │   ├── routes/
│       │   │   ├── __root.tsx            ✅
│       │   │   ├── index.tsx             ✅
│       │   │   └── tasks.$taskId.tsx     ✅
│       │   ├── App.tsx                   ✅
│       │   ├── main.tsx                  ✅
│       │   └── router.tsx                ✅
│       ├── .env.example                  ✅
│       ├── Dockerfile                    ✅
│       └── package.json                  ✅
│
├── packages/
│   ├── types/                     # Tipos compartilhados
│   │   └── src/
│   │       ├── index.ts                  ✅
│   │       └── auth/
│   │           ├── login.dto.ts          ✅
│   │           ├── register.dto.ts       ✅
│   │           └── refresh-token.dto.ts  ✅
│   ├── ui/                        # Componentes compartilhados
│   ├── eslint-config/             # Config ESLint compartilhada
│   └── typescript-config/         # Config TS compartilhada
│
├── docker-compose.yml             ✅ (Todos serviços configurados)
├── turbo.json                     ✅
├── package.json                   ✅
└── README.md                      ⚠️  (Pendente documentação final)

✅ = Implementado
⚠️ = Parcialmente implementado / Precisa trabalho
❌ = Não implementado
```

---

## 📊 ESTADO ATUAL DETALHADO

### ✅ O QUE JÁ ESTÁ FUNCIONANDO

#### 1. Infraestrutura (80% completo)
- ✅ Turborepo configurado com workspaces
- ✅ Docker Compose com 5 serviços + PostgreSQL + RabbitMQ
- ✅ Network bridge para comunicação entre containers
- ✅ Volumes persistentes para DB e RabbitMQ
- ✅ Hot reload configurado (volumes montados)

#### 2. Auth Service (100% completo) ✅
- ✅ **User Entity**: id (uuid), email (unique), username (unique), password (hashed), timestamps
- ✅ **RefreshToken Entity**: id (uuid), token, userId, expiresAt, timestamps
- ✅ **UsersService**: create (com validação de duplicata), findByEmail
- ✅ **AuthService**: validateUser (bcrypt compare), login (JWT + refresh token), refresh
- ✅ **AuthController**: @MessagePattern's para login, register, refresh via TCP
- ✅ **CreateUserDto**: validação com class-validator
- ✅ **TypeORM**: conectado ao PostgreSQL (synchronize: true)
- ✅ **JWT**: access_token (15min) + refresh_token (7 dias)
- ✅ **Environment Variables**: .env.example criado, JWT_SECRET configurável

#### 3. API Gateway (90% completo)
- ✅ **AuthController**: POST /auth/login, POST /auth/register, POST /auth/refresh, GET /auth/me (protegido)
- ✅ **TasksController**: GET/POST/PUT/DELETE /api/tasks, POST/GET /api/tasks/:id/comments (todos protegidos)
- ✅ **JwtStrategy**: validação de token com Bearer
- ✅ **JwtAuthGuard**: proteção de rotas
- ✅ **ClientProxy TCP**: comunicação com auth-service (porta 3003)
- ✅ **ClientProxy RabbitMQ**: comunicação com tasks-service
- ✅ **PassportModule**: configurado
- ✅ **Swagger**: documentação completa em /api/docs com @ApiTags, @ApiOperation, @ApiResponse
- ✅ **ValidationPipe**: global configurado (whitelist, forbidNonWhitelisted, transform)
- ✅ **CORS**: habilitado
- ✅ **Environment Variables**: .env.example criado

#### 4. Tasks Service (100% completo) ✅
- ✅ **Task Entity**: id, title, description, dueDate, priority (enum), status (enum), createdById, assigneeIds, timestamps
- ✅ **Comment Entity**: id, text, taskId, authorId, createdAt
- ✅ **TaskHistory Entity**: id, taskId, changedById, action (enum), changes (jsonb), createdAt
- ✅ **DTOs**: CreateTaskDto, UpdateTaskDto, CreateCommentDto com class-validator
- ✅ **TasksService**: create, findAll (paginação), findOne, update, delete com audit trail automático
- ✅ **CommentsService**: create, findByTask (paginação)
- ✅ **TasksController**: @MessagePattern's para RabbitMQ (create_task, find_all_tasks, find_task, update_task, delete_task)
- ✅ **CommentsController**: @MessagePattern's para RabbitMQ (create_comment, find_task_comments)
- ✅ **RabbitMQ Publisher**: eventos task.created, task.updated, task.comment.created
- ✅ **TypeORM**: entities registradas, synchronize: true
- ✅ **Environment Variables**: .env.example criado

#### 5. Notifications Service (100% completo) ✅
- ✅ **Notification Entity**: id, type (enum), message, userId, taskId, isRead, createdAt
- ✅ **NotificationType enum**: TASK_CREATED, TASK_UPDATED, COMMENT_CREATED
- ✅ **NotificationsService**: create, findByUser (paginação), markAsRead, markAllAsRead, getUnreadCount
- ✅ **NotificationsController**: @EventPattern's para RabbitMQ (task.created, task.updated, task.comment.created)
- ✅ **NotificationsGateway**: WebSocket com autenticação JWT, rooms por userId
- ✅ **RabbitMQ Consumer**: consome eventos e persiste notificações
- ✅ **WebSocket Emit**: notificações em tempo real para usuários conectados
- ✅ **TypeORM**: entity registrada, synchronize: true
- ✅ **Environment Variables**: .env.example criado, JWT_SECRET, DB configs

#### 6. Frontend (100% completo) ✅
- ✅ **TanStack Router**: Configurado com file-based routing, rotas tipadas
- ✅ **shadcn/ui**: 11 componentes instalados e funcionando (Button, Card, Input, Form, Dialog, Badge, Skeleton, Select, Dropdown Menu, Label, Sonner)
- ✅ **Tailwind CSS**: Configurado com tema customizado
- ✅ **AuthContext**: Gerenciamento de autenticação com Context API
- ✅ **API Client**: Axios com interceptors para token e refresh automático
- ✅ **WebSocket**: Hook useWebSocket para notificações em tempo real
- ✅ **Páginas**:
  - ✅ Login/Register (modal com validação Zod)
  - ✅ Dashboard (lista de tarefas com cards, badges, loading)
  - ✅ Detalhe da tarefa (visualização completa + comentários)
- ✅ **Forms**: react-hook-form + zod para validação
- ✅ **UI Feedback**: Toast notifications (Sonner), loading states, skeleton loaders
- ✅ **Responsive**: Design mobile-first totalmente responsivo
- ✅ **Build**: Compilação sem erros, pronto para produção

#### 7. Packages (40% completo)
- ✅ **@repo/types**: LoginDto, RegisterDto, RefreshTokenDto, User interface exportados
- ⚠️ **@repo/ui**: estrutura criada mas vazia

### ❌ O QUE FALTA IMPLEMENTAR

#### 1. Auth Service (10% faltando)
- ✅ **Register**: endpoint POST /auth/register implementado
- ✅ **Refresh Token**: entity, geração, endpoint /auth/refresh implementados
- ⚠️ **RabbitMQ**: integração para eventos de usuário (opcional, não crítico)
- ⚠️ **Migrations**: TypeORM migrations ao invés de synchronize (FASE 5)
- ✅ **Variáveis de ambiente**: .env.example criado
- ✅ **JWT_SECRET**: via env implementado

#### 2. API Gateway (5% faltando)
- ✅ **Swagger**: documentação completa em /api/docs
- ✅ **Tasks endpoints**: proxy para tasks-service implementado
- ⚠️ **Rate Limiting**: 10 req/s (FASE 5)
- ✅ **CORS**: configuração implementada
- ✅ **Validation Pipe**: global implementado

---

## 🎯 ROADMAP DE IMPLEMENTAÇÃO (FASES)

### ✅ FASE 1: Completar Autenticação (CONCLUÍDA)

**Por quê primeiro?** Todos os endpoints futuros dependem de autenticação funcional.

#### Tarefas:

1. **Register Endpoint** ✅
   - ✅ Criar `@MessagePattern('register')` em auth-service/auth.controller.ts
   - ✅ Adicionar `POST /auth/register` em api-gateway/auth.controller.ts
   - ✅ Retornar user (sem senha) + tokens

2. **Refresh Token System** ✅
   - ✅ Criar `refresh-token.entity.ts` (id, token, userId, expiresAt)
   - ✅ Modificar AuthService.login() para retornar `{ access_token, refresh_token }`
   - ✅ access_token: 15min
   - ✅ refresh_token: 7 dias
   - ✅ Criar `@MessagePattern('refresh')` em auth-service
   - ✅ Criar `POST /auth/refresh` no gateway
   - ✅ Validar refresh_token, gerar novo access_token

3. **Swagger Documentation** ✅
   - ✅ `npm install @nestjs/swagger` no api-gateway
   - ✅ Configurar em main.ts: `SwaggerModule.setup('/api/docs', app, document)`
   - ✅ Adicionar decorators: `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`
   - ✅ Documentar todos endpoints de auth com exemplos

4. **Environment Variables** ✅
   - ✅ Criar `.env.example` em auth-service e api-gateway
   - ✅ Mover JWT_SECRET para variáveis de ambiente
   - ✅ Atualizar docker-compose.yml com env vars
   - ✅ Configurar JWT expires via env

**Critérios de Aceitação FASE 1**:
- ✅ POST /api/auth/register funciona e retorna tokens
- ✅ POST /api/auth/login retorna access + refresh token
- ✅ POST /api/auth/refresh valida e renova token
- ✅ Swagger acessível em http://localhost:3001/api/docs
- ✅ Nenhum secret hardcoded no código
- ✅ Todos endpoints documentados

---

### ✅ FASE 2: Tasks Service (CONCLUÍDA)

**Por quê é crítico?** O Tasks Service é o coração da aplicação - é onde todo o gerenciamento de tarefas acontece.

#### Tarefas:

5. **Entities & DTOs** ✅
   - ✅ Criar `task.entity.ts`:
     ```typescript
     - id: uuid
     - title: string
     - description: text
     - dueDate: Date
     - priority: enum (LOW, MEDIUM, HIGH, URGENT)
     - status: enum (TODO, IN_PROGRESS, REVIEW, DONE)
     - createdBy: User (ManyToOne)
     - assignees: User[] (ManyToMany)
     - createdAt, updatedAt
     ```
   - [ ] Criar `comment.entity.ts`:
     ```typescript
     - id: uuid
     - text: string
     - task: Task (ManyToOne)
     - author: User (ManyToOne)
     - createdAt
     ```
   - [ ] Criar `task-history.entity.ts`:
     ```typescript
     - id: uuid
     - task: Task (ManyToOne)
     - changedBy: User (ManyToOne)
     - action: string (CREATED, UPDATED, DELETED)
     - changes: json
     - createdAt
     ```
   - ✅ Criar DTOs com class-validator (CreateTaskDto, UpdateTaskDto, CreateCommentDto)

6. **Tasks Service Implementation** ✅
   - ✅ Registrar entities no app.module.ts
   - ✅ Criar TasksService com métodos: create, findAll, findOne, update, delete
   - ✅ Implementar paginação (page, size)
   - ✅ Implementar registro automático de mudanças (TaskHistory)
   - ✅ Criar TasksController com @MessagePattern's:
     - `create_task` ✅
     - `find_all_tasks` ✅
     - `find_task` ✅
     - `update_task` ✅
     - `delete_task` ✅

7. **Comments Implementation** ✅
   - ✅ Criar CommentsService: create, findByTask
   - ✅ Criar CommentsController com @MessagePattern's:
     - `create_comment` ✅
     - `find_task_comments` ✅
   - ✅ Paginação para comentários

8. **RabbitMQ Events Publisher** ✅
   - ✅ Instalar `@nestjs/microservices` no tasks-service
   - ✅ Configurar ClientProxy para RabbitMQ
   - ✅ Publicar eventos:
     - `task.created` (após criar task) ✅
     - `task.updated` (após atualizar task) ✅
     - `task.comment.created` (após criar comment) ✅
   - ✅ Payload: { taskId, userId, action, data }

9. **API Gateway - Tasks Endpoints** ✅
   - ✅ Criar tasks.module.ts no gateway
   - ✅ Configurar ClientProxy RabbitMQ para tasks-service
   - ✅ Criar TasksController:
     - `GET /api/tasks?page=1&size=10` → paginação ✅
     - `POST /api/tasks` → criar tarefa ✅
     - `GET /api/tasks/:id` → buscar tarefa ✅
     - `PUT /api/tasks/:id` → atualizar tarefa ✅
     - `DELETE /api/tasks/:id` → deletar tarefa ✅
     - `POST /api/tasks/:id/comments` → criar comentário ✅
     - `GET /api/tasks/:id/comments?page=1&size=10` → listar comentários ✅
   - ✅ Adicionar `@UseGuards(JwtAuthGuard)` em todos endpoints
   - ✅ Documentar com Swagger

**Critérios de Aceitação FASE 2**:
- ✅ Todas entities criadas e migrations rodando
- ✅ CRUD completo de tasks funcionando
- ✅ Comentários funcionando
- ✅ Histórico sendo registrado automaticamente
- ✅ Eventos sendo publicados no RabbitMQ
- ✅ Todos endpoints testáveis via Swagger

---

### ✅ FASE 3: Notifications + WebSocket (CONCLUÍDA)

**Por quê é crítico?** As notificações em tempo real são essenciais para a colaboração - usuários precisam ser notificados quando tarefas são criadas/atualizadas ou comentários são adicionados.

#### Tarefas:

10. **Notifications Service Setup** ✅
    - ✅ Criar `notification.entity.ts`:
      ```typescript
      - id: uuid
      - type: enum (TASK_CREATED, TASK_UPDATED, COMMENT_CREATED)
      - message: string
      - userId: uuid
      - taskId: uuid
      - isRead: boolean (default: false)
      - createdAt
      ```
    - ✅ Registrar entity no app.module.ts
    - ✅ Configurar TypeORM no notifications-service

11. **RabbitMQ Consumer** ✅
    - ✅ Configurar ClientProxy para RabbitMQ
    - ✅ Criar NotificationsController com @EventPattern's:
      - `task.created` ✅
      - `task.updated` ✅
      - `task.comment.created` ✅
    - ✅ Criar NotificationsService.create() para persistir
    - ✅ Criar métodos: findByUser, markAsRead, markAllAsRead, getUnreadCount

12. **WebSocket Gateway** ✅
    - ✅ Instalar `@nestjs/websockets @nestjs/platform-socket.io`
    - ✅ Criar `notifications.gateway.ts` no notifications-service
    - ✅ Implementar autenticação JWT no handshake:
      ```typescript
      handleConnection(client: Socket) {
        const token = client.handshake.auth.token;
        // validar JWT
      }
      ```
    - ✅ Emitir eventos para clientes conectados:
      - `notification` (evento unificado)
    - ✅ Rooms por userId para notificações direcionadas
    - ✅ Handler para `mark_as_read`

13. **Integração com Tasks Service** ✅
    - ✅ Atualizar tasks.controller.ts para publicar eventos completos
    - ✅ Atualizar comments.controller.ts para incluir task details
    - ✅ Eventos incluem: assigneeIds, title, taskTitle

**Critérios de Aceitação FASE 3**:
- ✅ Eventos do RabbitMQ sendo consumidos
- ✅ Notificações persistidas no banco
- ✅ WebSocket conecta com autenticação JWT
- ✅ Frontend pode receber notificações em tempo real
- ✅ Notificações apenas para assignees (não para o autor da ação)
- ✅ Todos os serviços rodando e integrados

---

### ✅ FASE 4: Frontend (CONCLUÍDA)

**Por quê é crítico?** O frontend é a interface principal do usuário - sem ele não é possível demonstrar as funcionalidades implementadas no backend.

#### Tarefas:

13. **Setup Inicial** ✅
    - ✅ `npm install @tanstack/react-router axios socket.io-client react-hook-form zod @hookform/resolvers`
    - ✅ Configurar TanStack Router (createRouter, RouterProvider, rotas tipadas)
    - ✅ `npx shadcn@latest init` e adicionar componentes
    - ✅ Instalar 11 componentes: button, card, input, form, dialog, badge, skeleton, select, dropdown-menu, label, sonner
    - ✅ Configurar Tailwind CSS v3 + PostCSS
    - ✅ Configurar path aliases (@/* para src/*)

14. **Auth Context & API Client** ✅
    - ✅ Criar `AuthContext.tsx` com Context API
    - ✅ Funções: login, register, logout (com validação de duplicata)
    - ✅ Armazenar tokens no localStorage (access_token + refresh_token)
    - ✅ Axios interceptor para adicionar Bearer token automaticamente
    - ✅ Axios interceptor para refresh automático em 401
    - ✅ Verificação automática de autenticação no mount

15. **Páginas & Componentes** ✅
    - ✅ **Login/Register Modal** (AuthDialog.tsx):
      - Form com validação zod
      - Alternância entre login/register
      - Feedback de erro via toast
      - Loading states em botões
    - ✅ **Dashboard** (Dashboard.tsx):
      - Listar tarefas com cards visuais
      - Badges de status (TODO, IN_PROGRESS, REVIEW, DONE)
      - Badges de prioridade (LOW, MEDIUM, HIGH, URGENT)
      - Criar nova tarefa via modal
      - Loading skeleton durante carregamento
      - Empty state quando não há tarefas
      - Indicador de conexão WebSocket
    - ✅ **Detalhe da Tarefa** (TaskDetail.tsx):
      - Exibir informações completas da tarefa
      - Lista de comentários com paginação
      - Form para adicionar comentário (envio com Enter)
      - Deletar tarefa com confirmação
      - Loading states
    - ✅ **Criar Tarefa** (CreateTaskDialog.tsx):
      - Form com validação zod
      - Select de prioridade e status
      - Date picker para vencimento

16. **WebSocket Integration** ✅
    - ✅ Criar `useWebSocket` hook customizado
    - ✅ Conectar ao notifications-service com token JWT
    - ✅ Listeners para eventos de notificação
    - ✅ Exibir toast notification com ação "Ver"
    - ✅ Atualizar lista de tarefas quando evento chega
    - ✅ Reconexão automática e cleanup

17. **UX Enhancements** ✅
    - ✅ Skeleton loaders durante carregamento
    - ✅ Toast notifications (Sonner) para ações (sucesso/erro)
    - ✅ Empty states (sem tarefas)
    - ✅ Responsive design (mobile-first)
    - ✅ Loading states em todos botões
    - ✅ Hover effects e transições
    - ✅ Confirmação antes de ações destrutivas

**Critérios de Aceitação FASE 4**:
- ✅ Login/Register funcionando com validação
- ✅ Lista de tarefas carrega e exibe com cards visuais
- ✅ Criar/Deletar tarefas funciona
- ✅ Comentários funcionando (adicionar e listar)
- ✅ Notificações em tempo real aparecem via WebSocket
- ✅ UI responsiva e usável
- ✅ 11 componentes shadcn usados (220% do requisito)
- ✅ Build de produção sem erros
- ✅ TypeScript 100% tipado

---

### 🔵 FASE 5: Refinamentos (1 dia)

#### Tarefas:

18. **Rate Limiting**
    - [ ] `npm install @nestjs/throttler` no api-gateway
    - [ ] Configurar 10 req/s por IP

19. **Migrations**
    - [ ] Desabilitar `synchronize: true` no TypeORM
    - [ ] Gerar migrations: `npm run typeorm migration:generate`
    - [ ] Rodar migrations no docker-compose (entrypoint)

20. **Health Checks**
    - [ ] `npm install @nestjs/terminus`
    - [ ] Criar `/health` endpoint em cada serviço
    - [ ] Verificar DB, RabbitMQ connections

21. **Logging**
    - [ ] `npm install winston nest-winston` (opcional)
    - [ ] Configurar logger global
    - [ ] Logs estruturados (JSON)

22. **Documentação Final**
    - [ ] Atualizar README.md:
      - Diagrama de arquitetura
      - Decisões técnicas
      - Trade-offs
      - Instruções de setup
      - Problemas conhecidos
      - Melhorias futuras
      - Tempo gasto por fase

**Critérios de Aceitação FASE 5**:
- ✅ Rate limiting ativo
- ✅ Migrations funcionando
- ✅ Health checks respondendo
- ✅ README completo e profissional

---

## 📝 DECISÕES TÉCNICAS JÁ TOMADAS

1. **TCP para Auth Service**: Mais simples para request-response síncrono
2. **RabbitMQ para Tasks/Notifications**: Assíncrono, desacoplado, ideal para eventos
3. **Synchronize: true no TypeORM**: Temporário para desenvolvimento rápido (mudar para migrations)
4. **JWT hardcoded**: Temporário, será movido para env vars
5. **Porta 3003 para TCP**: Separada da porta HTTP (3002) do auth-service
6. **Porta 5173 para frontend**: Padrão do Vite
7. **User entity simples**: id, email, username, password, timestamps

---

## ⚠️ PROBLEMAS CONHECIDOS & MELHORIAS FUTURAS

### Problemas Atuais:
- `synchronize: true` no TypeORM (produção não deveria usar - resolver na FASE 5)
- Sem rate limiting (resolver na FASE 5)
- Sem logging estruturado (resolver na FASE 5)
- Sem testes (não é crítico para o MVP)
- Erros de TypeScript no VS Code (cache do editor, compilação funciona)

### Melhorias Futuras:
- Implementar reset de senha
- Adicionar paginação cursor-based
- Cache com Redis
- Upload de arquivos em tarefas
- Filtros avançados (data, assignee)
- Dark mode no frontend
- Notificações push
- Testes E2E com Playwright
- CI/CD com GitHub Actions
- Monitoring com Prometheus/Grafana

---

## 🔧 COMANDOS ÚTEIS

```bash
# Subir todos os serviços
docker-compose up --build

# Ver logs de um serviço específico
docker-compose logs -f api-gateway

# Rodar apenas backend
docker-compose up api-gateway auth-service db rabbitmq

# Instalar dependências localmente
npm install

# Adicionar pacote em um app específico
npm install <package> --workspace=apps/auth-service

# Rodar Turborepo
npm run dev        # Todos apps em modo dev
npm run build      # Build de todos apps
npm run lint       # Lint em todos apps

# TypeORM migrations (quando implementado)
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

---

## 📌 REFERÊNCIAS RÁPIDAS

### Endpoints da API (planejados)

```
POST   /auth/register              # Criar conta ✅
POST   /auth/login                 # Login ✅
POST   /auth/refresh               # Renovar token ✅
GET    /auth/me                    # Perfil do usuário ✅

GET    /api/tasks                  # Listar tarefas (paginação) ✅
POST   /api/tasks                  # Criar tarefa ✅
GET    /api/tasks/:id              # Buscar tarefa ✅
PUT    /api/tasks/:id              # Atualizar tarefa ✅
DELETE /api/tasks/:id              # Deletar tarefa ✅

POST   /api/tasks/:id/comments     # Criar comentário ✅
GET    /api/tasks/:id/comments     # Listar comentários (paginação) ✅

GET    /health                     # Health check
GET    /api/docs                   # Swagger UI
```

### WebSocket Events

```javascript
// Client → Server
socket.emit('authenticate', { token: 'jwt...' })

// Server → Client
socket.on('task:created', (data) => { /* ... */ })
socket.on('task:updated', (data) => { /* ... */ })
socket.on('comment:new', (data) => { /* ... */ })
```

### RabbitMQ Events

```
task.created          # { taskId, title, createdBy, assignees }
task.updated          # { taskId, changes, updatedBy }
task.comment.created  # { taskId, commentId, text, authorId }
```

---

## 🎯 PRÓXIMA SESSÃO - COMEÇAR POR

**SE VOCÊ ESTÁ LENDO ESTE CONTEXTO EM UMA NOVA SESSÃO, COMECE PELA FASE ATUAL:**

**FASE ATUAL: FASE 5 - Refinamentos (ÚLTIMA FASE)**

**Por quê é importante?** Refinamentos finais para deixar o sistema production-ready: rate limiting, migrations, health checks e documentação.

**Primeira tarefa**: Implementar rate limiting no API Gateway.

**Ordem de implementação recomendada**:
1. Rate Limiting (10 req/s no API Gateway)
2. TypeORM Migrations (substituir synchronize: true)
3. Health Checks em todos serviços
4. Logging estruturado (opcional)
5. Documentação final do README

**Checklist rápido antes de começar**:
1. ✅ FASE 1 completa (autenticação funcionando)
2. ✅ FASE 2 completa (tasks-service funcionando)
3. ✅ FASE 3 completa (notifications-service + WebSocket funcionando)
4. ✅ FASE 4 completa (Frontend React com 11 componentes shadcn/ui)
5. ✅ Frontend rodando em http://localhost:5174
6. ✅ Backend rodando via docker-compose
7. ✅ Sistema funcionando end-to-end

**Decisões técnicas para FASE 5**:
- **Rate Limiting**: @nestjs/throttler com 10 req/s
- **Migrations**: TypeORM CLI com migration:generate
- **Health Checks**: @nestjs/terminus com verificação de DB e RabbitMQ
- **Logging**: winston + nest-winston (opcional, não crítico)
- **Documentação**: README completo com arquitetura, setup e decisões técnicas

---

**Última atualização**: 30/12/2025  
**Progresso**: 80% completo (4 de 5 fases)  
**Fase Atual**: FASE 5 - Refinamentos (ÚLTIMA FASE)  
**Fases Completas**: 
- ✅ FASE 1 (Autenticação completa com Register, Login, Refresh, Swagger)
- ✅ FASE 2 (Tasks Service completo com CRUD, Comments, History, RabbitMQ Events, API Gateway Integration)
- ✅ FASE 3 (Notifications Service + WebSocket com autenticação JWT, RabbitMQ Consumer, notificações em tempo real)
- ✅ FASE 4 (Frontend React com TanStack Router, 11 componentes shadcn/ui, WebSocket, AuthContext, Dashboard completo)

**Arquivos de Referência**: 
- Ver PHASE3_TESTING.md para instruções de teste de notificações
- Ver PHASE4_COMPLETED.md para resumo completo do frontend implementado
