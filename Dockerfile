FROM node:18-alpine AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build

# Второй этап - создание минимального образа для запуска
FROM node:18-alpine

# Установка рабочей директории
WORKDIR /app

# Копирование зависимостей из этапа сборки
COPY --from=builder /app/node_modules ./node_modules

# Копирование скомпилированного кода из этапа сборки
COPY --from=builder /app/dist ./dist

# Копирование package.json для запуска
COPY --from=builder /app/package*.json ./

# Открытие порта, который будет использоваться приложением
EXPOSE 5555

# Запуск приложения
CMD ["node", "dist/main"]