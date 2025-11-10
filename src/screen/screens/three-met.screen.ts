import { BaseScreen, MessageContent, ScreenContext } from '../interfaces';
import { Screen } from '../decorators/screen.decorator';
import { TelegramService } from '../../telegram/telegram.service';
import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';

@Injectable()
@Screen()
export class ThreeMetScreen extends BaseScreen<ThreeMetScreenState> {
  public name = 'three-met';

  constructor(private readonly telegramService: TelegramService) {
    super();
  }

  public async onEnter(context: ScreenContext<ThreeMetScreenState>): Promise<MessageContent> {
    const text = `А вот как! 
Столкнувшись с давлением, мы не стали героически молчать. 
Мы сделали то, что умели лучше всего...`

    const text2 = `...Мы создали свой собственный мир`

    const text3 = `Сначала было страшно...что тебя поймут не так, посчитают шутку пошлой
Но постепенно мы перешли на более дерзкий язык, понятный нам обоим. 

И нашли новое применение для... огурцов! хд

Ну конечно! Они же идеально подходят для:(выбери самый безумный вариант)`

 const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('Ёлки на НГ 🎄', 'crazy'),
      ],
      [
        Markup.button.callback('Наказания - несогласных c нами 👊', 'crazy'),
      ],
      [
        Markup.button.callback('Игры в дартс 🎯', 'crazy'),
        Markup.button.callback('Защиты от Эрни 🦮', 'crazy'),
      ],
    ]);

    await this.telegramService.sendMessage(context.ctx, text)

    await new Promise(resolve => setTimeout(resolve, 3000));

    await this.telegramService.sendMessage(context.ctx, text2)

    await new Promise(resolve => setTimeout(resolve, 2000));

    return {text: text3, keyboard}
  }

  public async onMessage(context: ScreenContext<ThreeMetScreenState>): Promise<any> {
    if (context.state?.waitingAnswer === true) {
      const secondText = `Запомню это. 
Спасибо, что была тем человеком, с которым можно было построить этот мост. 
Тот, кто тебя действительно понимает - редкость. А у нас получилось 🫂`

    const text = `А теперь давай проверим, насколько мы знаем друг друга.

Как думаешь, что создатель этого бота (то есть, я) больше всего ценит в тебе?`

    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Твою стальную выдержку 💪', 'you_perfect'),
        ],
        [
            Markup.button.callback('Твоё хулиганское чувство юмора 😈', 'you_perfect'),
        ],
        [
            Markup.button.callback('Твою неожиданную женственность 🌸', 'you_perfect'),
        ],
        [
            Markup.button.callback('Твою безграничную доброту', 'you_perfect'),
        ],
        [
            Markup.button.callback('Всё сразу и даже больше 💫', 'you_perfect'),
        ],
    ]);
    
    await this.telegramService.sendMessage(context.ctx, secondText)

    await context.setState({ waitingAnswer: false });

    await new Promise(resolve => setTimeout(resolve, 3000));

    await this.telegramService.sendMessage(context.ctx, text, {keyboard})



  }
}

  async onCallback(context: ScreenContext): Promise<any> {
    if (context.callbackData === 'crazy') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const text = `Ахах, именно! 
И самое главное - мы нашли того, с кем можно безнаказанно нести такую дичь. 

С тобой даже самый дурацкий кринж становился нашей маленькой тайной и это прекрасно 😄

А ведь это было только начало. Наш общий язык пополнялся с каждой беседой...`;

const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Ты серьёзно? 😂', 'you_really'),
            Markup.button.callback('Это было легендарно! 🔥', 'legendary'),
        ],
        [
            Markup.button.callback('Я до сих пор в шоке 🫠', 'shocked'),
        ],
    ]);

      await this.telegramService.sendMessage(context.ctx, text, {keyboard:keyboard})
    }

    if (context.callbackData === 'you_really') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const text = `Абсолютно! 
Я до сих пор удивляюсь, как мы дошли до жизни такой. И ни капли не жалею`;

      await this.telegramService.sendMessage(context.ctx, text)
      await context.setState({ waitingAnswer: true });
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mustHaveText = `Но дело ведь не в самих шутках, а в том, что мы смогли быть собой - странными, неидеальными, смешными. 
И это приняли друг в друге.

Что для тебя было самым ценным в этом нашем «общем языке»?`;
      await this.telegramService.sendMessage(context.ctx, mustHaveText)
      console.log(context.state)
    }

    if (context.callbackData === 'legendary') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const text = `Ещё как! 
Это был наш творческий пик. Жаль, премию за кринж года нам так и не вручили`;

      await this.telegramService.sendMessage(context.ctx, text)
      await context.setState({ waitingAnswer: true });
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mustHaveText = `Но дело ведь не в самих шутках, а в том, что мы смогли быть собой - странными, неидеальными, смешными. 
И это приняли друг в друге.

Что для тебя было самым ценным в этом нашем «общем языке»?`;
      await this.telegramService.sendMessage(context.ctx, mustHaveText)
      console.log(context.state)
    }

    if (context.callbackData === 'shocked') {
        
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const text = `Понимаю. 
Иногда я и сам вспоминаю и думаю: "И мы это действительно обсуждали?" 😄`;

      await this.telegramService.sendMessage(context.ctx, text)
      await context.setState({ waitingAnswer: true });
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mustHaveText = `Но дело ведь не в самих шутках, а в том, что мы смогли быть собой - странными, неидеальными, смешными. 
И это приняли друг в друге.

Что для тебя было самым ценным в этом нашем «общем языке»?`;
      await this.telegramService.sendMessage(context.ctx, mustHaveText)
      console.log(context.state)
    }

    if (context.callbackData === 'you_perfect') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const text = `Правильный ответ... Всё сразу! 

Но сила - не только в выдержке перед трудностями. Она - в готовности открыться, пусть и постепенно. 
Цепляет твоя самоотдача, когда ты во что-то веришь. 
Цепляет твоё хулиганство, которое превращало любой стресс в абсурд. 
И цепляет та самая женственность, которая проскальзывала в заботе и делала наше общение... настоящим.

Ты совмещаешь в себе, казалось бы, несовместимое. И в этом твоя уникальность`;
 
    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Что же в финале? 🎁', 'final'),
        ],
    ])

      await this.telegramService.sendMessage(context.ctx, text, {keyboard:keyboard})
    }

    if (context.callbackData === 'final') {
        return {
        navigation: {
          screen: 'final',
        },
      };
      
    }
    
  }
}

interface ThreeMetScreenState {
  waitingAnswer?: boolean;
}