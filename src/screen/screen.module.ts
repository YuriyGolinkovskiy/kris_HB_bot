import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ScreenManager } from './screen.manager';
import { WelcomeScreen } from './screens/welcome.screen';
import { FirstMetScreen } from './screens/first-met.screen';
import { TelegramModule } from '../telegram/telegram.module';
import { SecondMetScreen } from './screens/second-met.screen';
import { ThreeMetScreen } from './screens/three-met.screen';
import { FinalMetScreen } from './screens/final.screen';

@Module({
  imports: [DiscoveryModule, forwardRef(() => TelegramModule)],
  providers: [ScreenManager, WelcomeScreen, FirstMetScreen, SecondMetScreen, ThreeMetScreen, FinalMetScreen],
  exports: [ScreenManager],
})
export class ScreenModule {}