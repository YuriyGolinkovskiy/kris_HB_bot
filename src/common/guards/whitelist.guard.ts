import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrafExecutionContext } from 'nestjs-telegraf';

@Injectable()
export class WhitelistGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = TelegrafExecutionContext.create(context);
    const { from } = ctx.getContext();
    const whitelist = this.configService
      .get<string>('TELEGRAM_WHITELIST_IDS')
      .split(',');

    return whitelist.includes(String(from.id));
  }
}