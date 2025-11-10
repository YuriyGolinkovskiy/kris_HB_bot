import { AppContext } from '../screen.manager';

export interface MessageContent {
  text: string;
  keyboard?: any;
  removeKeyboard?: boolean;
}

export interface Navigation {
  navigation: {
    screen: string;
  };
}

export interface ScreenContext<T = any> {
  ctx: AppContext;
  state: T;
  callbackData?: string;
  setState: (state: T) => Promise<void>;
}

export interface Screen<T = any> {
  name: string;
  onEnter(context: ScreenContext<T>): Promise<MessageContent>;
  onMessage(context: ScreenContext<T>): Promise<void | MessageContent | Navigation>;
  onCallback?(context: ScreenContext<T>): Promise<void | MessageContent | Navigation>;
  onLeave?(context: ScreenContext<T>): Promise<void>;
}

export abstract class BaseScreen<T = any> implements Screen<T> {
  public abstract name: string;
  public abstract onEnter(context: ScreenContext<T>): Promise<MessageContent>;
  public abstract onMessage(context: ScreenContext<T>): Promise<void | MessageContent | Navigation>;
  public async onCallback?(context: ScreenContext<T>): Promise<void | MessageContent | Navigation> {}
  public async onLeave?(context: ScreenContext<T>): Promise<void> {}
}
export interface SendMessageOptions {
  removeKeyboard?: boolean;
  keyboard?: any;
}