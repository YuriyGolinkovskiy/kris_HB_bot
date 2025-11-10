import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { SendMessageOptions } from '../screen/interfaces/screen.interface';
import { Context, Start, Command, Update, On, Hears } from 'nestjs-telegraf';
import { Telegraf, type Context as TelegrafContext } from 'telegraf';
import { ScreenManager, AppContext } from '../screen/screen.manager';

/**
 * Service for handling Telegram bot operations using nestjs-telegraf decorators
 */
@Update()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    @Inject(ScreenManager) private readonly screenManager: ScreenManager,
  ) {}

  /**
   * Handles the /start command using nestjs-telegraf decorator
   * @param ctx The Telegraf context
   */
  @Start()
  async onStart(@Context() ctx: AppContext) {
    try {
      const userId = ctx.from?.id;
      const userName = ctx.from?.username || `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim();
      this.logger.log(`Пользователь ${userName} (${userId}) отправил команду: /start`);
      // Устанавливаем начальный экран для пользователя
      ctx.session.currentScreen = 'welcome';
      ctx.session.screenState = {};
      
      // Передаем управление ScreenManager
      await this.screenManager.handleMessage(ctx);
    } catch (error) {
      this.logger.error('Error handling /start command:', error);
      throw new HttpException(
        'Failed to handle start command',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

 /**
   * Handles the /reset command using nestjs-telegraf decorator
   * @param ctx The Telegraf context
   */
  @Command('reset')
  async onReset(@Context() ctx: AppContext) {
    try {
      const userId = ctx.from?.id;
      const userName = ctx.from?.username || `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim();
      this.logger.log(`Пользователь ${userName} (${userId}) отправил команду: /reset`);
      // Сбрасываем состояние экрана
      ctx.session.currentScreen = 'welcome';
      ctx.session.screenState = {};
      
      // Передаем управление ScreenManager
      await this.screenManager.handleMessage(ctx);
    } catch (error) {
      this.logger.error('Error handling /reset command:', error);
      throw new HttpException(
        'Failed to handle reset command',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  /**
   * Handles all text messages using nestjs-telegraf decorator
   * @param ctx The Telegraf context
   */
  @On('text')
  async onMessage(@Context() ctx: AppContext) {
    try {
      const userId = ctx.from?.id;
      const userName = ctx.from?.username || `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim();
      if ('text' in ctx.message) {
        const text = ctx.message.text;
        this.logger.log(`Пользователь ${userName} (${userId}) отправил текст: "${text}"`);
      }
      // Передаем управление ScreenManager
      await this.screenManager.handleMessage(ctx);
    } catch (error) {
      this.logger.error('Error handling message:', error);
      throw new HttpException(
        'Failed to handle message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Handles sticker messages
   * @param ctx The Telegraf context
   */
  // @On('sticker')
  // async onSticker(@Context() ctx: AppContext) {
  //   try {
  //     const userId = ctx.from?.id;
  //     const userName = ctx.from?.username || `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim();
  //     if ('sticker' in ctx.message) {
  //       const stickerId = ctx.message.sticker.file_id;
  //       this.logger.log(`Пользователь ${userName} (${userId}) отправил стикер: ${stickerId}`);
  //     }
  //     await this.screenManager.handleMessage(ctx);
  //   } catch (error) {
  //     this.logger.error('Error handling sticker:', error);
  //     throw new HttpException(
  //       'Failed to handle sticker',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  /**
   * Sends a message to a specific chat
   * @param ctx The Telegraf context
   * @param message The message to send
   * @returns A promise that resolves when the message is sent
   */
  async sendMessage(
    ctx: AppContext,
    message: string,
    options: SendMessageOptions = {},
  ): Promise<any> { // Изменено с Promise<void> на Promise<any>
    try {
      const sentMessage = await ctx.reply(message, options.keyboard); // Сохраняем результат
      ctx.session.lastMessageWithKeyboardId = sentMessage.message_id;
      return sentMessage; // Возвращаем отправленное сообщение
    } catch (error) {
      this.logger.error('Error sending message:', error);
      throw new HttpException(
        'Failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async clearPreviousKeyboard(ctx: AppContext): Promise<void> {
    const lastMessageId = ctx.session.lastMessageWithKeyboardId;
    if (lastMessageId) {
      try {
        await ctx.telegram.editMessageReplyMarkup(
          ctx.chat.id,
          lastMessageId,
          undefined,
          undefined,
        );
        ctx.session.lastMessageWithKeyboardId = null;
      } catch (error) {
        this.logger.warn(
          `Could not edit message reply markup for message ${lastMessageId}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Handles all callback queries from inline keyboards
   * @param ctx The Telegraf context
   */
  @On('callback_query')
async onCallbackQuery(@Context() ctx: AppContext) {
  try {
    const userId = ctx.from?.id;
    const userName = ctx.from?.username || `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim();
    
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      const callbackData = ctx.callbackQuery.data;
      
      // Получаем текст кнопки
      let buttonText = 'Неизвестно';
      if (ctx.callbackQuery.message && 'reply_markup' in ctx.callbackQuery.message) {
        const markup = ctx.callbackQuery.message.reply_markup;
        if (markup && 'inline_keyboard' in markup) {
          for (const row of markup.inline_keyboard) {
            for (const button of row) {
              if ('callback_data' in button && button.callback_data === callbackData) {
                buttonText = button.text;
                break;
              }
            }
          }
        }
      }
      
      this.logger.log(`Пользователь ${userName} (${userId}) нажал кнопку "${buttonText}" с данными: "${callbackData}"`);
    }
    
    await this.screenManager.handleCallbackQuery(ctx);
  } catch (error) {
    this.logger.error('Error handling callback query:', error);
  }
}
}