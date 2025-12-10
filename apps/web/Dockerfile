FROM node:20-alpine AS development

# Diretório root do monorepo
WORKDIR /app

# Copia todos os arquivos para dentro do container
COPY . .

RUN npm install -g turbo

# Vai para a pasta web
WORKDIR /app/apps/web

# Instala dependências da pasta web
RUN npm install

# Executa o dev
CMD ["npm", "run", "dev"]