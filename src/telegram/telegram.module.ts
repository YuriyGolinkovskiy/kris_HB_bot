import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import * as TelegrafSessionLocal from 'telegraf-session-local';
import { TelegramService } from './telegram.service';
import { CommonModule } from '../common/common.module';
import { ScreenModule } from '../screen/screen.module';

const session = new TelegrafSessionLocal({ database: 'session_db.json' });

@Module({
  imports: [
    CommonModule,
    forwardRef(() => ScreenModule),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        console.log('token: ' + token);
        if (!token || token === 'your_telegram_bot_token_here') {
          console.warn(
            'Warning: Telegram bot token is not configured. Please set TELEGRAM_BOT_TOKEN in your .env file.',
          );
          // Return configuration that prevents bot from launching when token is missing
          return { token: '', launchOptions: false };
        }
        return {
          token,
          middlewares: [session.middleware()],
          launchOptions: { polling: true, dropPendingUpdates: true },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    TelegramService,
  ],
  controllers: [],
  exports: [TelegramService],
})
export class TelegramModule {}
