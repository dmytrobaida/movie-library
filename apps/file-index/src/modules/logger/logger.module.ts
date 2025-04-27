import { Global, Module } from '@nestjs/common';
import { LoggerController } from 'src/modules/logger/controllers/logger.controller';
import { LoggerGateway } from 'src/modules/logger/gateways/logger.gateway';
import { WinstonLogger } from 'src/modules/logger/loggers/winston.logger';
import { RedisTransport } from 'src/modules/logger/transports/redis.transport';

@Global()
@Module({
  controllers: [LoggerController],
  providers: [WinstonLogger, RedisTransport, LoggerGateway],
  exports: [WinstonLogger],
})
export class LoggerModule {}
