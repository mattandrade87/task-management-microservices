FROM node:20-alpine AS development

WORKDIR /app

COPY . .

RUN npm install -g turbo

WORKDIR /app/apps/web

RUN npm install

CMD ["npm", "run", "dev"]