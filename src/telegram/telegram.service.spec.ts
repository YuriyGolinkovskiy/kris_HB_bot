import { Test, TestingModule } from '@nestjs/testing';
import { TelegramService } from './telegram.service';
import { ConfigService } from '@nestjs/config';
import { Context } from 'telegraf';

describe('TelegramService', () => {
  let service: TelegramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
      ],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const mockContext = {
        reply: jest.fn().mockResolvedValue({}),
      } as unknown as Context;
      const message = 'Test message';

      await service.sendMessage(mockContext, message);

      expect(mockContext.reply).toHaveBeenCalledWith(message);
    });

    it('should throw an error when sending message fails', async () => {
      const mockContext = {
        reply: jest.fn().mockRejectedValue(new Error('Failed to send message')),
      } as unknown as Context;
      const message = 'Test message';

      await expect(service.sendMessage(mockContext, message)).rejects.toThrow('Failed to send message');
    });
  });
});