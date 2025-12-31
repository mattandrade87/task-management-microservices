# 🔔 Testing Notifications Service - Phase 3

## ✅ O que foi implementado

### 1. **Notification Entity** (`notifications-service`)
- Entity completa com TypeORM
- Tipos de notificação: TASK_CREATED, TASK_UPDATED, COMMENT_CREATED
- Campos: id, type, message, userId, taskId, isRead, createdAt

### 2. **NotificationsService**
- `create()`: Cria nova notificação
- `findByUser()`: Lista notificações do usuário (paginado)
- `markAsRead()`: Marca notificação como lida
- `markAllAsRead()`: Marca todas como lidas
- `getUnreadCount()`: Conta notificações não lidas

### 3. **RabbitMQ Consumer** (`NotificationsController`)
- `@EventPattern('task.created')`: Escuta criação de tasks
- `@EventPattern('task.updated')`: Escuta atualização de tasks
- `@EventPattern('task.comment.created')`: Escuta novos comentários
- Persiste notificações no banco
- Emite eventos via WebSocket

### 4. **WebSocket Gateway** (`NotificationsGateway`)
- Autenticação JWT no handshake
- Rooms por userId (`user:${userId}`)
- Evento `notification` emitido aos usuários
- Suporte a `mark_as_read` message

### 5. **Integração com Tasks Service**
- `tasks-service` publica eventos com todos os campos necessários:
  - `task.created`: taskId, title, createdById, assigneeIds
  - `task.updated`: taskId, title, updatedById, assigneeIds, changes
  - `task.comment.created`: taskId, commentId, text, authorId, taskTitle, assigneeIds

## 🧪 Como Testar

### Pré-requisitos

Certifique-se de que todos os serviços estão rodando:

```bash
docker-compose ps
```

Você deve ver:
- ✅ db (PostgreSQL)
- ✅ rabbitmq (RabbitMQ)
- ✅ auth-service
- ✅ tasks-service
- ✅ api-gateway
- ✅ notifications-service

### 1. Registrar e Fazer Login

```bash
# Registrar usuário 1
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "username": "user1",
    "password": "password123"
  }'

# Registrar usuário 2
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@example.com",
    "username": "user2",
    "password": "password123"
  }'

# Login usuário 1
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123"
  }'

# Salve o access_token retornado
export TOKEN1="eyJhbGc..."

# Login usuário 2
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@example.com",
    "password": "password123"
  }'

# Salve o access_token retornado
export TOKEN2="eyJhbGc..."
```

### 2. Obter User IDs

```bash
# User 1
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer $TOKEN1"

# Salve o "id" retornado
export USER1_ID="uuid-here"

# User 2
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer $TOKEN2"

# Salve o "id" retornado
export USER2_ID="uuid-here"
```

### 3. Criar Task (Notificação será enviada)

```bash
# User 1 cria task atribuída ao User 2
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implementar feature X",
    "description": "Descrição da task",
    "priority": "HIGH",
    "status": "TODO",
    "assigneeIds": ["'$USER2_ID'"]
  }'

# Salve o "id" da task retornada
export TASK_ID="uuid-here"
```

**O que acontece:**
1. ✅ Task é criada no banco
2. ✅ Evento `task.created` é publicado no RabbitMQ
3. ✅ `notifications-service` consome o evento
4. ✅ Notificação é persistida no banco para USER2
5. ✅ Evento WebSocket é emitido para USER2 (se conectado)

### 4. Verificar Logs do Notifications Service

```bash
docker logs notifications-service --tail=50 --follow
```

Você deve ver:
```
[NotificationsController] Received task.created event: {...}
[NotificationsService] Notification created: <uuid> for user <USER2_ID>
[NotificationsGateway] Notification sent to user <USER2_ID>: <notification_id>
```

### 5. Verificar Notificações no Banco

```bash
# Conectar ao PostgreSQL
docker exec -it db psql -U postgres -d challenge_db

# Listar notificações
SELECT * FROM notifications ORDER BY "createdAt" DESC LIMIT 5;

# Verificar notificações de um usuário específico
SELECT * FROM notifications WHERE "userId" = '<USER2_ID>';
```

### 6. Atualizar Task (Outra notificação)

```bash
# User 1 atualiza a task
curl -X PUT http://localhost:3001/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

**O que acontece:**
1. ✅ Task é atualizada
2. ✅ Evento `task.updated` é publicado
3. ✅ Notificação para USER2: "A tarefa 'Implementar feature X' foi atualizada"

### 7. Criar Comentário (Terceira notificação)

```bash
# User 1 comenta na task
curl -X POST http://localhost:3001/api/tasks/$TASK_ID/comments \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Estou começando a trabalhar nisso"
  }'
```

**O que acontece:**
1. ✅ Comentário é criado
2. ✅ Evento `task.comment.created` é publicado
3. ✅ Notificação para USER2: "Novo comentário na tarefa 'Implementar feature X'"

### 8. Testar WebSocket (Frontend Simulation)

Crie um arquivo HTML para testar o WebSocket:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Notifications WebSocket Test</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>Notifications Test</h1>
  <div id="notifications"></div>

  <script>
    // Substitua pelo seu token JWT
    const token = 'YOUR_ACCESS_TOKEN_HERE';

    const socket = io('http://localhost:3004', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
      document.getElementById('notifications').innerHTML += '<p>✅ Connected!</p>';
    });

    socket.on('notification', (data) => {
      console.log('📬 Notification received:', data);
      const div = document.createElement('div');
      div.innerHTML = `
        <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
          <strong>${data.type}</strong><br>
          ${data.message}<br>
          <small>${new Date(data.createdAt).toLocaleString()}</small>
        </div>
      `;
      document.getElementById('notifications').appendChild(div);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected');
      document.getElementById('notifications').innerHTML += '<p>❌ Disconnected</p>';
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      document.getElementById('notifications').innerHTML += `<p>❌ Error: ${error.message}</p>`;
    });
  </script>
</body>
</html>
```

Abra o arquivo no navegador e veja as notificações chegando em tempo real!

## 📊 Verificação do RabbitMQ

Acesse o RabbitMQ Management UI:
- URL: http://localhost:15672
- User: admin
- Password: admin

Verifique:
1. **Queues**: `tasks_queue` e `notifications_queue` devem estar presentes
2. **Connections**: Deve haver conexões dos microserviços
3. **Message rate**: Quando você criar uma task, deve ver mensagens sendo processadas

## 🔍 Troubleshooting

### Notificações não aparecem

```bash
# Verificar se o notifications-service está rodando
docker ps | grep notifications

# Verificar logs
docker logs notifications-service --tail=100

# Verificar se o RabbitMQ está acessível
docker exec notifications-service ping -c 2 rabbitmq
```

### WebSocket não conecta

```bash
# Verificar se a porta 3004 está exposta
docker ps | grep notifications

# Testar conexão HTTP
curl http://localhost:3004

# Verificar CORS
# O serviço está configurado para aceitar http://localhost:5173
# Se você testar de outro domínio, atualize FRONTEND_URL no docker-compose.yml
```

### Eventos não são consumidos

```bash
# Verificar logs do tasks-service
docker logs tasks-service --tail=50

# Verificar se eventos estão sendo publicados
# Deve aparecer logs de "emit" quando criar/atualizar tasks

# Verificar RabbitMQ Management
# http://localhost:15672
# Verifique se messages estão sendo enfileiradas e consumidas
```

## ✨ Próximos Passos (FASE 4)

Agora que o backend está completo com notificações em tempo real, o próximo passo é implementar o **Frontend React** com:

1. **TanStack Router** para roteamento
2. **shadcn/ui** components (Button, Card, Input, Form, Dialog)
3. **Auth Context** para gerenciar autenticação
4. **WebSocket integration** para receber notificações
5. **Pages**: Login, Dashboard, Task Detail

## 🎉 Sucesso!

Se você conseguiu:
- ✅ Criar tasks e ver notificações no banco
- ✅ Ver logs do notifications-service processando eventos
- ✅ Conectar via WebSocket e receber notificações

**PARABÉNS! A FASE 3 está completa!** 🚀

O sistema agora suporta notificações em tempo real completas com:
- Persistência no banco
- Eventos RabbitMQ
- WebSocket com autenticação JWT
- Notificações direcionadas por usuário
