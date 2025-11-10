import { BaseScreen, MessageContent, ScreenContext } from '../interfaces';
import { Screen } from '../decorators/screen.decorator';
import { TelegramService } from '../../telegram/telegram.service';
import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';

@Injectable()
@Screen()
export class FirstMetScreen extends BaseScreen<FirstMetScreenState> {
  public name = 'first-met';

  private readonly correctPhrase = `Чтоб обидно не было что не пишут :D
  
  на рыбалку на акул когда?`;

  constructor(private readonly telegramService: TelegramService) {
    super();
  }

  public async onEnter(context: ScreenContext<FirstMetScreenState>): Promise<MessageContent> {
    setTimeout(async () => {
      await context.ctx.replyWithPhoto(
    { source: './src/images/first.png' },
    {
      caption: `Помнишь, как всё начиналось? 
Два незнакомца в одном альянсе, первые глупые попытки пошутить, первый спонтанный диалог и первая фраза, задавшая тон тому, что есть сейчас

Напиши эту фразу:`,
      
    }
  );
      await context.setState({ waitingForPhrase: true });
}, 3000);

    return {
      text: 'И так, наш первый пункт назначения - самое начало...',
    };
  }

  public async onMessage(context: ScreenContext<FirstMetScreenState>): Promise<any> {
    if (context.state?.waitingForPhrase === true) {
      const secondText = `С этой фразы началось наше путешествие.
Из двух незнакомцев в одном альянсе мы стали... кем? 

Этим предстоит заняться дальше.`
    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Что было дальше? →', 'what_next'),
        ]
    ]);


      if (context.ctx.message && 'text' in context.ctx.message) {
        if (this.checkPartialMatch(context.ctx.message.text.toLowerCase())) {
          const text = `Верно!) 
"Чтоб обидно не было..." - та самая первая строка.
С неё начался не просто диалог, а наша общая реальность. 
И следом мы уже вместе собирались на рыбалку за акулами)`
          await this.telegramService.sendMessage(context.ctx, text)
        } else {
          const text = `Очень близко по духу! Но самой первой фразой было: 
"Чтоб обидно не было, что не пишут :D". 
Та самая нелепая попытка завести диалог, которую ты успешно подхватила. 
И которая переросла во всё то, что у нас есть сейчас.`
         await this.telegramService.sendMessage(context.ctx, text)
        }
        await context.setState({ waitingForPhrase: false });
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.telegramService.sendMessage(context.ctx, secondText, { keyboard: keyboard });
      }
    }
  }

  async onCallback(context: ScreenContext): Promise<any> {
    if (context.callbackData === 'what_next') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      await this.telegramService.sendMessage(context.ctx, `Из двух незнакомцев мы превратились в сообщников по абсурду.

Но настоящая команда проверяется не в моменты спокойствия, а в огне🔥

Следующая глава - о том, как мы прошли первое испытание на прочность.`)
      await new Promise(resolve => setTimeout(resolve, 3000));
      return {
        navigation: {
          screen: 'second-met',
        },
      };
    }
  }

  private keyPhrases = [
        "чтоб",
        "было",
        "обидно",
        "что",
        "не",
        "пишут",
        "на",
        "рыбалку",
        "акул",
        "когда"
    ];

  private checkPartialMatch(input) {
        const normalizedInput = input.toLowerCase();
        
        const matchedPhrases = this.keyPhrases.filter(phrase =>
            normalizedInput.includes(phrase)
        );
        
        return matchedPhrases.length >= 4;
    }

}

interface FirstMetScreenState {
  waitingForPhrase?: boolean;
}