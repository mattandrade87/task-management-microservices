# TypeORM Migrations Guide

## Overview

As aplicações agora utilizam migrations do TypeORM para gerenciar mudanças no schema do banco de dados de forma controlada e versionada.

## Estrutura

- **auth-service**: User, RefreshToken entities
- **tasks-service**: Task, Comment, TaskHistory entities  
- **notifications-service**: Notification entity

## Scripts Disponíveis

Cada serviço possui os seguintes scripts npm:

```bash
# Gerar uma nova migration baseada nas mudanças das entities
npm run migration:generate -- src/migrations/MigrationName

# Executar todas as migrations pendentes
npm run migration:run

# Reverter a última migration executada
npm run migration:revert
```

## Como Usar

### 1. Gerar Nova Migration

Quando você modificar uma entity, gere uma migration:

```bash
cd apps/auth-service
npm run migration:generate -- src/migrations/AddNewField
```

### 2. Executar Migrations

Para aplicar migrations ao banco de dados:

```bash
cd apps/auth-service
npm run migration:run
```

### 3. Reverter Migration

Se precisar desfazer a última migration:

```bash
cd apps/auth-service
npm run migration:revert
```

## Produção

Em produção, as migrations são executadas automaticamente quando o serviço inicia graças à configuração `migrationsRun: true` no TypeORM.

## Notas Importantes

- **Sempre gere migrations** após modificar entities
- **Revise as migrations** antes de executar em produção
- **Commit migrations** no Git junto com as mudanças de código
- **Não modifique migrations** que já foram executadas em produção
- As migrations estão em `src/migrations/` e são compiladas para `dist/migrations/`

## Estado Atual

O sistema já possui as entities criadas. Para gerar as migrations iniciais:

```bash
# Auth Service
cd apps/auth-service
npm run migration:generate -- src/migrations/InitialSchema

# Tasks Service  
cd apps/tasks-service
npm run migration:generate -- src/migrations/InitialSchema

# Notifications Service
cd apps/notifications-service
npm run migration:generate -- src/migrations/InitialSchema
```
