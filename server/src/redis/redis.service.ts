import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private publisher: Redis;
  private subscriber: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    const redisConfig = {
      host,
      port,
    };

    this.publisher = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);

    this.publisher.on('error', (err) => this.logger.error('Redis Publisher Error', err));
    this.subscriber.on('error', (err) => this.logger.error('Redis Subscriber Error', err));
  }

  async publish(channel: string, message: string) {
    await this.publisher.publish(channel, message);
  }

  subscribe(channel: string, callback: (message: string) => void) {
    this.subscriber.subscribe(channel, (err) => {
      if (err) {
        this.logger.error(`Failed to subscribe to channel ${channel}`, err);
        return;
      }
      this.logger.log(`Subscribed to channel: ${channel}`);
    });

    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        callback(msg);
      }
    });
  }

  onModuleDestroy() {
    this.publisher.quit();
    this.subscriber.quit();
  }
}
