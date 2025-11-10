import { BaseScreen, MessageContent, ScreenContext } from '../interfaces';
import { Screen } from '../decorators/screen.decorator';
import { TelegramService } from '../../telegram/telegram.service';
import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';

@Injectable()
@Screen()
export class FinalMetScreen extends BaseScreen<FinalMetScreenState> {
  public name = 'final';

  constructor(private readonly telegramService: TelegramService) {
    super();
  }

  public async onEnter(context: ScreenContext<FinalMetScreenState>): Promise<MessageContent> {
    const text = `Стой, главный вопрос: 
ты ещё не передумала продолжать этот квест?`


 const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('Конечно нет, веди дальше! 👊', 'pre_final'),
      ],
            [
        Markup.button.callback('Устала, но останавливать поздно 🫠', 'pre_final'),
      ],
      [
        Markup.button.callback(' А можно я сама всё угадаю? 😏', 'pre_final'),
      ],
    ]);

    return {text: text, keyboard}
  }

  public async onMessage(context: ScreenContext<FinalMetScreenState>): Promise<any> {
    

  }


  async onCallback(context: ScreenContext): Promise<any> {
    if (context.callbackData === 'pre_final') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const text = `Отлично! 
Ты прошла через всё это... Вспомнила наше начало, наши испытания, наш уникальный язык и нашу силу.

И теперь ты здесь.

Я не просто так провёл тебя по этому пути. Я хотел, чтобы ты увидела нашу историю со стороны - такую, какой вижу её я. 

Каждый её этап - это часть тебя, которую я ценю.

И сейчас, в твой 25й день рожденья, я хочу подарить тебе не просто вещь, а подтверждение того, что я всегда внимателен к тебе`;

const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Я смущена... 🥹', 'upsss'),
            Markup.button.callback('Я в восторге! ✨', 'wowww'),
        ],
        [
            Markup.button.callback('Юр, не томи! 😫', 'faster'),
        ],
    ]);

      await this.telegramService.sendMessage(context.ctx, text, {keyboard:keyboard})
    }

    if (context.callbackData === 'upsss') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const text = `Эй, смущаться здесь нечего. Всё это - правда. 
А теперь держи...`;

      await this.telegramService.sendMessage(context.ctx, text)
      const keyboardReward = this.keyboardReward;
      const textReward = this.textReward;
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.telegramService.sendMessage(context.ctx, textReward,{keyboard: keyboardReward})

      const finalText = this.finalText;
      return{text: finalText}
    }

     if (context.callbackData === 'wowww') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const text = `Рад, что тебе нравится! 
Самое интересное - впереди. Держи...`;

      await this.telegramService.sendMessage(context.ctx, text)
      const keyboardReward = this.keyboardReward;
      const textReward = this.textReward;
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.telegramService.sendMessage(context.ctx, textReward,{keyboard: keyboardReward})

      const finalText = this.finalText;
      return{text: finalText}
    }

     if (context.callbackData === 'faster') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const text = `Ахах, ладно, ладно, не буду!
Тогда встречай...`
      await this.telegramService.sendMessage(context.ctx, text)
      const keyboardReward = this.keyboardReward;
      const textReward = this.textReward;
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const url = process.env.CERT_URL;

    await context.ctx.replyWithPhoto(
    url,
    {
      caption: textReward,
      reply_markup: this.keyboardReward.reply_markup
    });
      //await this.telegramService.sendMessage(context.ctx, textReward,{keyboard: keyboardReward})

      const finalText = this.finalText;
      return{text: finalText}
    }
  }
    private keyboardReward = Markup.inlineKeyboard([
        [
            Markup.button.url('Для жестких переговоров 🐕‍🦺', 'https://www.wildberries.ru/catalog/537502467/detail.aspx'),
        ],
        [
            Markup.button.url('Малыш Эрни оценит 🦴', 'https://www.wildberries.ru/catalog/165046202/detail.aspx?targetUrl=MI'),
        ],
        [
            Markup.button.url('На память обо мне 🐺', 'https://www.wildberries.ru/catalog/174918194/detail.aspx?targetUrl=MI'),
            Markup.button.url('Тебе для души 🏀', 'https://www.wildberries.ru/catalog/49601561/detail.aspx'),
        ],
          [
            Markup.button.url('ОТКРЫТЬ ОБЯЗАТЕЛЬНО!🔓', process.env.CERT_URL),
        ],
    ]);

    private finalText = `С Днём Рождения, Крис! 🎂

Спасибо, что ты - та самая, с кем можно пройти через огонь, воду и медные трубы, а в итоге просто угарнуть со смеху над каким-то огурцом.

Жду фоточек, если захочешь похвастаться своим выбором!

Твой Юрий, крепко обнял и не отпускаю 🤗`
    
    private textReward = `Ну что ж, вот твой маленький приз! 🎁
Подарочный сертификат. Выбирай что душе угодно!

А чтобы помочь с вдохновением, я собрал пару идей, основанных на наших разговорах. 
Может, что-то приглянется!`

  
}

interface FinalMetScreenState {

}