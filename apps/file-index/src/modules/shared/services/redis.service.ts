import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private readonly client: RedisClientType;

  constructor(configService: ConfigService) {
    const redisUrl = configService.getOrThrow<string>('REDIS_URL');

    this.client = createClient({
      url: redisUrl,
    });
  }

  async getClient() {
    const copy = this.client.duplicate();
    await copy.connect();
    return copy;
  }
}
