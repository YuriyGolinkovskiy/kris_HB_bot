import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Context as TelegrafContext } from 'telegraf';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { TelegramService } from '../telegram/telegram.service';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Screen, MessageContent, ScreenContext, Navigation, SendMessageOptions } from './interfaces/screen.interface';
import { SCREEN } from './decorators/screen.decorator';

export interface SessionData {
  currentScreen: string;
  screenState: any;
  lastMessageWithKeyboardId?: number;
  globalState?: {
    userId: number;
    waitingForErnieText?: boolean;
  };
}

export interface AppContext extends TelegrafContext {
  session: SessionData;
}

@Injectable()
export class ScreenManager {
  private readonly logger = new Logger(ScreenManager.name);
  private readonly screens = new Map<string, Screen<any>>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly moduleRef: ModuleRef,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
  ) {
    this.initializeScreens();
  }

  private initializeScreens() {
    const providers = this.discoveryService.getProviders();
    
    providers.forEach((wrapper: InstanceWrapper<Screen>) => {
      const { instance, metatype } = wrapper;
      
      if (metatype && this.hasScreenMetadata(metatype)) {
        if (instance) {
          this.registerScreen(instance);
        } else {
          try {
            const screenInstance = this.moduleRef.get(metatype, { strict: false });
            if (screenInstance) {
              this.registerScreen(screenInstance);
            }
          } catch (error) {
            this.logger.warn(`Не удалось создать экземпляр экрана ${metatype.name}: ${error.message}`);
          }
        }
      }
    });

    this.logger.log(`Зарегистрировано экранов: ${this.screens.size}`);
  }

  private hasScreenMetadata(target: any): boolean {
    if (!target || typeof target !== 'function') {
      return false;
    }
    
    try {
      return Reflect.hasMetadata(SCREEN, target);
    } catch (error) {
      this.logger.warn(`Ошибка при проверке метаданных для ${target.name}: ${error.message}`);
      return false;
    }
  }

  registerScreen(screen: Screen<any>): void {
    if (!screen || !screen.name) {
      this.logger.warn('Попытка зарегистрировать невалидный экран');
      return;
    }

    if (this.screens.has(screen.name)) {
      this.logger.warn(`Экран с именем "${screen.name}" уже зарегистрирован.`);
      return;
    }
    
    this.screens.set(screen.name, screen);
    this.logger.log(`Зарегистрирован экран: ${screen.name}`);
  }

  async goToScreen(ctx: AppContext, screenName: string): Promise<void> {
    await this.telegramService.clearPreviousKeyboard(ctx);
    const session = ctx.session;
    const currentScreen = this.screens.get(session.currentScreen);
    const nextScreen = this.screens.get(screenName);

    if (!nextScreen) {
      this.logger.error(`Попытка перейти на несуществующий экран: ${screenName}`);
      await this.goToScreen(ctx, 'welcome');
      return;
    }

    if (currentScreen && currentScreen.onLeave) {
      try {
        await currentScreen.onLeave(this.createScreenContext(ctx, session));
      } catch (error) {
        this.logger.error(`Ошибка в onLeave экрана ${session.currentScreen}: ${error.message}`);
      }
    }

    const previousScreen = session.currentScreen;
    session.currentScreen = screenName;

    this.logger.log(`Переход с экрана ${previousScreen} на ${screenName}`);

    try {
      const messageContent = await nextScreen.onEnter(this.createScreenContext(ctx, session));
      
      const options: SendMessageOptions = {
        keyboard: messageContent.keyboard,
      };
      const sentMessage = await this.telegramService.sendMessage(ctx, messageContent.text, options);
      if (messageContent.keyboard) {
        session.lastMessageWithKeyboardId = sentMessage.message_id;
      }

    } catch (error) {
      this.logger.error(`Ошибка в onEnter экрана ${screenName}: ${error.message}`);
      session.currentScreen = previousScreen;
      await this.goToScreen(ctx, 'welcome');
    }
  }
  
  public createScreenContext<T>(ctx: AppContext, session: SessionData, callbackData?: string): ScreenContext<T> {
    return {
      ctx,
      get state() {
        return ctx.session.screenState as T;
      },
      callbackData,
      setState: async (state: T) => {
        ctx.session.screenState = { ...ctx.session.screenState, ...state };
      },
    };
  }

  private isNavigation(result: any): result is Navigation {
      return result && typeof result === 'object' && 'navigation' in result;
  }

  async handleMessage(ctx: AppContext): Promise<void> {
    const session = ctx.session;
    
    if (!session.currentScreen) {
      await this.goToScreen(ctx, 'welcome');
      return;
    }

    const currentScreen = this.screens.get(session.currentScreen);

    if (!currentScreen) {
      this.logger.error(`Текущий экран "${session.currentScreen}" не найден`);
      await this.goToScreen(ctx, 'welcome');
      return;
    }

    try {
      const result = await currentScreen.onMessage(this.createScreenContext(ctx, session));

      if (this.isNavigation(result)) {
        await this.goToScreen(ctx, result.navigation.screen);
      } else if (result) {
        const options: SendMessageOptions = {
          keyboard: result.keyboard,
        };
        const sentMessage = await this.telegramService.sendMessage(ctx, result.text, options);
        if (result.keyboard) {
          session.lastMessageWithKeyboardId = sentMessage.message_id;
        }
      }
    } catch (error) {
      this.logger.error(`Ошибка в onMessage экрана ${session.currentScreen}: ${error.message}`);
      await ctx.reply('Произошла ошибка. Попробуйте еще раз.');
    }
  }

  async handleCallbackQuery(ctx: AppContext): Promise<void> {
    const session = ctx.session;
    if (!('callback_query' in ctx.update)) {
      return;
    }
    const callbackQuery = ctx.update.callback_query;
    const callbackData = 'data' in callbackQuery ? callbackQuery.data : undefined;
    
    if (!session.currentScreen) {
      await this.goToScreen(ctx, 'welcome');
      return;
    }

    const currentScreen = this.screens.get(session.currentScreen);

    if (!currentScreen) {
      this.logger.error(`Текущий экран "${session.currentScreen}" не найден`);
      await this.goToScreen(ctx, 'welcome');
      return;
    }

    if (currentScreen.onCallback) {
      try {
        const result = await currentScreen.onCallback(this.createScreenContext(ctx, session, callbackData));

        if (this.isNavigation(result)) {
          await this.goToScreen(ctx, result.navigation.screen);
        } else if (result) {
          const options: SendMessageOptions = {
            keyboard: result.keyboard,
          };
          const sentMessage = await this.telegramService.sendMessage(ctx, result.text, options);
          if (result.keyboard) {
            session.lastMessageWithKeyboardId = sentMessage.message_id;
          }
        }
        
        await ctx.answerCbQuery();
      } catch (error) {
        this.logger.error(`Ошибка в onCallback экрана ${session.currentScreen}: ${error.message}`);
        await ctx.reply('Произошла ошибка при обработке вашего запроса.');
      }
    }
  }


  getRegisteredScreens(): string[] {
    return Array.from(this.screens.keys());
  }
}