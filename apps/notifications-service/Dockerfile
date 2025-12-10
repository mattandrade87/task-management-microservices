FROM node:20-alpine AS development

WORKDIR /app/apps/notifications-service

RUN npm install -g turbo


CMD sh -c "npm install && npm run start:dev"