FROM node:18-alpine

WORKDIR /app

# Копируем и устанавливаем ВСЕ зависимости (включая dev)
COPY package*.json ./
RUN npm ci

# Копируем и собираем через npx
COPY . .
RUN npx nest build

# Чистим dev зависимости (опционально)
RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/main"]