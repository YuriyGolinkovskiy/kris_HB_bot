import { Markup } from 'telegraf';
import { BaseScreen, MessageContent, ScreenContext, Navigation } from '../interfaces/screen.interface';
import { Screen } from '../decorators/screen.decorator';
import { TelegramService } from '../../telegram/telegram.service';
import { Start } from 'nestjs-telegraf';

@Screen()
export class WelcomeScreen extends BaseScreen {
  public name = 'welcome';

  constructor(private readonly telegramService: TelegramService) {
    super();
  }

  public onEnter(context: ScreenContext): Promise<MessageContent> {
    const text = 'Приветствую, Крис. Я - Хранитель Воспоминаний. Мне поручено провести тебя по тропам, что знают лишь двое...Готова ли ты отправиться в путешествие?';
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('Да, конечно!🚀', 'go_to_first_met'),
        Markup.button.callback('Боюсь, но лезу 👀', 'show_scared_but_going'),
      ],
      [
        Markup.button.callback('Шо происходит,Юр? 🤨', 'show_details'),
        Markup.button.callback('Пасиб,но нет❌', 'no_thanks'),
      ],
    ]);

    return Promise.resolve({ text, keyboard });
  }

  @Start()
  async start(context: ScreenContext){
    
  }

  public async onMessage(context: ScreenContext): Promise<void | MessageContent | Navigation> {
    const messageText = context.ctx.message && 'text' in context.ctx.message ? context.ctx.message.text : undefined;

    const waitingErniText = context.ctx.session.globalState?.waitingForErnieText == true;
    if (messageText && messageText.toLowerCase() === 'эрни вперед!') {
      await this.telegramService.sendMessage(context.ctx, 'Слышу и повинуюсь! Как же я ждал этого...');
      context.ctx.session.globalState.waitingForErnieText = false;
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        navigation: {
          screen: 'first-met',
        },
      };
    }

    if(messageText !== '/start'){
      return;
    }

    const text = 'Приветствую, Крис. Я - Хранитель Воспоминаний. Мне поручено провести тебя по тропам, что знают лишь двое...Готова ли ты отправиться в путешествие?';
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('Да, конечно! 🚀', 'go_to_first_met'),
        Markup.button.callback('Боюсь, но лезу 👀', 'show_scared_but_going'),
      ],
      [
        Markup.button.callback('Шо происходит,Юр? 🤨', 'show_details'),
        Markup.button.callback('Пасиб,но нет ❌', 'no_thanks'),
      ],
    ]);
    return { text, keyboard };
  }

  async onCallback(context: ScreenContext): Promise<any> {
    if (context.callbackData === 'go_to_first_met') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      await this.telegramService.sendMessage(context.ctx, 'Отлично! Тогда начнем.')
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        navigation: {
          screen: 'first-met',
        },
      };
    }
     if (context.callbackData === 'go_to_met') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      await this.telegramService.sendMessage(context.ctx, 'Ахах, вот это поворот! Ну тогда держись..')
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        navigation: {
          screen: 'first-met',
        },
      };
    }
    if (context.callbackData === 'show_scared_but_going') {
       await this.telegramService.clearPreviousKeyboard(context.ctx);
       const messageContent = this.handleScaredButGoingButton();
       await this.telegramService.sendMessage(context.ctx, messageContent.text, { keyboard: messageContent.keyboard });
    }
    if (context.callbackData === 'show_details') {
        await this.telegramService.clearPreviousKeyboard(context.ctx);
        return this.handleShowDetails();
    }

    if(context.callbackData === 'feer_but_i_ready'){
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      const messageContent = this.handleFeerButIReady();
      await this.telegramService.sendMessage(context.ctx, messageContent.text);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        navigation: {
          screen: 'first-met',
        },
      };
    }

    if (context.callbackData === 'no_thanks') {
      const messageContent = this.handleNoThanks();
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      await this.telegramService.sendMessage(context.ctx, messageContent.text, { keyboard: messageContent.keyboard });
    }

    if (context.callbackData === 'lets_go') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      await this.telegramService.sendMessage(context.ctx, `Так-то лучше! Уверен, тебе понравится..`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        navigation: {
          screen: 'first-met',
        },
      };
    }

    if (context.callbackData === 'me_need_time') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      await this.telegramService.sendMessage(context.ctx, `Понимаю. Хранитель всегда ждёт.  
Но просто запомни: когда будешь готова - скажи волшебные слова «Эрни, вперёд!», и дверь откроется.

До встречи, Крис. ✨`);
       context.ctx.session.globalState = {
        'userId':context.ctx.from.id,
        'waitingForErnieText' : true
      };
    }

    if (context.callbackData === 'already_thanks') {
      await this.telegramService.clearPreviousKeyboard(context.ctx);
      await this.telegramService.sendMessage(context.ctx, `Понял-принял. Жаль. 
Но ладно, подарок никуда не денется. Если вдруг захочешь узнать, что за кринж придумал мой создатель. 

Просто напиши "Эрни, вперёд!" и дверь откроется)

С днём рожденья тебя!`);
      context.ctx.session.globalState = {
        'userId':context.ctx.from.id,
        'waitingForErnieText' : true
      };
    }
  
  }

  private handleScaredButGoingButton(): MessageContent {
    const text = 'Страх - это нормально. Но знай, за каждым испытанием тебя ждёт кусочек нашей общей истории. И я всегда на подстраховке.\n\nГотова сделать первый шаг?';
    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Всё равно страшно, но я в деле! 💪', 'feer_but_i_ready'),
        ],
        [
            Markup.button.callback('Расскажи подробнее🤔', 'show_details'),
        ],
    ]);
    return { text, keyboard };
  }

  private handleShowDetails(): MessageContent {
    const text = `А вот это уже интереснее!
Конкретно - происходит операция «Вспомнить всё».
А если по-простому - твой день рождения, а у меня для тебя приготовлен квест-подарок.

Вот и вся магия! Теперь полезаешь в эту кроличью нору? 🐇`;

    const keyboard = Markup.inlineKeyboard([
      [
          Markup.button.callback('Аа,ну так бы сразу. Погнали!', 'go_to_met'),
      ],
      [
          Markup.button.callback('Все равно пасиб,нет ❌', 'already_thanks'),
      ],
    ]);
    return { text, keyboard };
  }

  private handleFeerButIReady():MessageContent{
    const text = 'Самые крутые приключения начинаются с дрожи в коленках! Держись - будет интересно..'
    return { text };
  }

  private handleNoThanks():MessageContent{
    const text = `Как скажешь)
Но знай: твой подарок ждёт тебя за дверью, для которой есть только один ключ - это ты.

Может, просто заглянешь одним глазком? 👁️`;

    const keyboard = Markup.inlineKeyboard([
      [
          Markup.button.callback('Ладно уговорил,давай попробуем 😏', 'lets_go'),
      ],
      [
          Markup.button.callback('Мне нужно время ⏳', 'me_need_time'),
      ],
  
    ]);
    return { text, keyboard };
  }
}