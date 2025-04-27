import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { LoggingEvent } from 'src/modules/logger/types/redis-events';
import { RedisService } from 'src/modules/shared/services/redis.service';
import Transport from 'winston-transport';

@Injectable()
export class RedisTransport extends Transport implements OnModuleInit {
  private redisClient: RedisClientType;

  constructor(private readonly redisService: RedisService) {
    super();
    this.silent = true;
  }

  async onModuleInit() {
    this.redisClient = await this.redisService.getClient();
    this.silent = false;
  }

  async log(info: any, next: () => void) {
    await this.redisClient.publish(LoggingEvent, JSON.stringify(info));
    next();
  }
}
