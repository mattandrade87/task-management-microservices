FROM node:20-alpine AS development

WORKDIR /app/apps/api-gateway

RUN npm install -g turbo


CMD sh -c "npm install && npm run start:dev" 