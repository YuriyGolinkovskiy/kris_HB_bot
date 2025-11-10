import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { ConfigModule } from '@nestjs/config';
import { ScreenModule } from './screen/screen.module';
import { APP_GUARD } from '@nestjs/core';
import { WhitelistGuard } from './common/guards/whitelist.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TelegramModule,
    ScreenModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: WhitelistGuard,
    },
  ],
})
export class AppModule {}