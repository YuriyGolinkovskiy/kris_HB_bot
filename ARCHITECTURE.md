# Архитектура: Глобальное ограничение доступа по "белому списку"

Этот документ описывает архитектуру механизма для ограничения доступа к Telegram-боту на основе "белого списка" `telegram_id`.

## 1. Выбранный подход: NestJS Guard

Для реализации этой задачи был выбран `Guard`, так как это основной и семантически верный инструмент для реализации логики авторизации в NestJS. Он предоставляет доступ к `ExecutionContext` и позволяет принять однозначное решение о разрешении или запрете доступа к обработчику.

## 2. Структура `WhitelistGuard`

Будет создан класс `WhitelistGuard`, реализующий интерфейс `CanActivate`.

- **Расположение файла:** `src/common/guards/whitelist.guard.ts`
- **Зависимости:** `@nestjs/common`, `@nestjs/config`, `@nestjs/core`, `telegraf`, `nestjs-telegraf`.

### Логика работы:

1.  `Guard` будет внедряемым (`Injectable`).
2.  В конструкторе он будет получать зависимость `ConfigService` для доступа к переменным окружения.
3.  Основная логика будет реализована в методе `canActivate(context: ExecutionContext)`.

## 3. Получение `telegram_id` и "белого списка"

### `telegram_id` пользователя:

`Guard` получит `telegram_id` из контекста выполнения (`ExecutionContext`):

1.  Из `ExecutionContext` извлекается контекст `Telegraf` с помощью `TelegrafExecutionContext.create(context)`.
2.  Из контекста `Telegraf` (`ctx`) получается `id` пользователя: `ctx.from.id`.

### "Белый список" (`whitelist`):

1.  Список разрешенных `telegram_id` будет храниться в файле `.env` в переменной `TELEGRAM_WHITELIST_IDS`. ID перечисляются через запятую.
    ```env
    TELEGRAM_WHITELIST_IDS=12345678,87654321
    ```
2.  Внутри `Guard`, с помощью `ConfigService`, будет получена эта строка.
3.  Строка будет преобразована в массив чисел (`number[]`).
4.  `Guard` будет проверять, входит ли `telegram_id` текущего пользователя в полученный массив.

## 4. Глобальная интеграция

`WhitelistGuard` будет применяться глобально ко всему приложению. Это гарантирует, что любое входящее обновление от Telegram (сообщение, нажатие кнопки и т.д.) будет проходить проверку.

Это достигается путем регистрации `Guard` в качестве глобального провайдера `APP_GUARD` в корневом модуле `AppModule` ([`src/app.module.ts`](src/app.module.ts:1)).

**Пример регистрации:**

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { WhitelistGuard } from './common/guards/whitelist.guard';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from './telegram/telegram.module';
import { ScreenModule } from './screen/screen.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TelegramModule,
    ScreenModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: WhitelistGuard,
    },
  ],
})
export class AppModule {}
```

## 5. Диаграмма последовательности (Mermaid)

```mermaid
sequenceDiagram
    participant User as Пользователь
    participant Telegram
    participant KrisBot as NestJS App
    participant WhitelistGuard as WhitelistGuard
    participant Handler as Обработчик [Update, On, Command]

    User->>+Telegram: Отправляет сообщение
    Telegram->>+KrisBot: Пересылает Update
    KrisBot->>+WhitelistGuard: canActivate(context)
    WhitelistGuard-->>KrisBot: Получает telegram_id из context
    WhitelistGuard-->>KrisBot: Получает WHITELIST_IDS из ConfigService
    alt telegram_id в "белом списке"
        WhitelistGuard->>KrisBot: return true
        KrisBot->>+Handler: Вызывает обработчик
        Handler-->>-KrisBot: 
        KrisBot-->>-Telegram: 
        Telegram-->>-User: 
    else telegram_id отсутствует
        WhitelistGuard->>KrisBot: return false (ForbiddenException)
        KrisBot-->>-Telegram: Завершает обработку
        Telegram-->>-User: (Нет ответа)
    end