import { BaseScreen, MessageContent, ScreenContext } from '../interfaces';
import { Screen } from '../decorators/screen.decorator';
import { TelegramService } from '../../telegram/telegram.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Markup } from 'telegraf';
import { Context, On, Update } from 'nestjs-telegraf';
import { AppContext, ScreenManager } from '../screen.manager';

@Update()
@Screen()
export class SecondMetScreen extends BaseScreen<SecondMetScreenState> {
  public name = 'second-met';
  readonly logger = new Logger(SecondMetScreen.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly screenManager: ScreenManager,
  ) {
    super();
  }

  public async onEnter(context: ScreenContext<SecondMetScreenState>): Promise<MessageContent> {
    await context.setState({ waitingSticker: false });
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('Помню... 😓 ', 'remember'),
      ],
    ]);
    return {
      text: `Но любая история - это не только смех. 
      
Вскоре мы столкнулись с первыми настоящими трудностями. 

Помнишь тот стресс и неразбериху, когда рушился старый альянс?
Ты тогда не смогла перевести свой основной аккаунт, приняв поспешное решение... но это оказалось началом новой, не менее интересной истории, в которой мы оказались вместе. 

Это было настоящее увлекательное приключение.`,
    keyboard: keyboard,
    };
  }

  public async onMessage(context: ScreenContext<SecondMetScreenState>): Promise<any> {
  }

  async onCallback(context: ScreenContext<SecondMetScreenState>): Promise<any> {
    
    if (context.callbackData === 'remember') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const text = `Именно в такие моменты проверяется любая связь. 
      
Ты тогда больше всего нуждалась в том, чтобы...`

const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('Чтобы меня просто выслушали и поддержали 👂', 'listen_me'),
      ],
      [
        Markup.button.callback('Чтобы мы вместе посмеялись над этим бардаком 😄', 'light_together'),
      ]
    ]); 
     
      await this.telegramService.sendMessage(context.ctx, text, { keyboard: keyboard });
    }


     if (context.callbackData === 'listen_me') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const text = `Да. Иногда самое важное - не дать совет, а просто быть рядом и дать понять, что ты не одна. 

Спасибо, что позволила мне быть этим человеком. Это многое для меня значило 🫂`

      await this.telegramService.sendMessage(context.ctx, text);

      await new Promise(resolve => setTimeout(resolve, 3000));

      const messageContent = await this.waitingStickerText(context)
      await context.setState({ waitingSticker: true });
      
      await this.telegramService.sendMessage(context.ctx, messageContent.text)
    }

    if (context.callbackData === 'light_together') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const text = `Верно! Наш юмор тогда стал оружием против хаоса.

Спасибо, что даже в трудную минуту оставалась собой и позволяла мне быть собой.

Вместе мы превращали стресс в абсурд 😄`

      await this.telegramService.sendMessage(context.ctx, text);
      
      await new Promise(resolve => setTimeout(resolve, 3000));

      const messageContent = await this.waitingStickerText(context)
      await context.setState({ waitingSticker: true });
      
      await this.telegramService.sendMessage(context.ctx, messageContent.text)
    }

    if (context.callbackData === 'how_it') {
      return {
        navigation: {
          screen: 'three-met',
        },
      };
    }
}
  

    async waitingStickerText(context: ScreenContext<SecondMetScreenState>){
        const text = `Мы прошли через это. И стало ясно, что мы - не просто сообщники по абсурду.
Мы - надёжный тыл друг для друга.

А теперь давай закрепим это воспоминание.
Скинь стикер, который лучше всего описывает твои эмоции сейчас, когда ты вспоминаешь всю ту историю с альянсами.`
        
        return {text}
    }

    @On('sticker')
      async onSticker(@Context() ctx: AppContext) {
        try {
      const userId = ctx.from?.id;
      const userName = ctx.from?.username || `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim();
      if ('sticker' in ctx.message) {
        const stickerId = ctx.message.sticker.file_id;
        this.logger.log(`Пользователь ${userName} (${userId}) отправил стикер: ${stickerId}`);
      }
      await this.screenManager.handleMessage(ctx);
    } catch (error) {
      this.logger.error('Error handling sticker:', error);
      throw new HttpException(
        'Failed to handle sticker',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
        
        const screenContext = this.screenManager.createScreenContext<SecondMetScreenState>(ctx, ctx.session);
        if(screenContext.state?.waitingSticker == true){
 
        const text = `Запомню этот стикер как официальную печать нашего испытания 😄
 
Теперь, когда мы знаем, что можем выдержать любое давление, самое время вспомнить, как мы научились с ним справляться`;
 
 const keyboard = Markup.inlineKeyboard([
       [
         Markup.button.callback('И как же? →', 'how_it'),
       ],
     ]);
         await screenContext.setState({ waitingSticker: false });
         await this.telegramService.sendMessage(ctx, text, {keyboard: keyboard});
     }
 }
}


interface SecondMetScreenState {
  waitingSticker?: boolean;
}