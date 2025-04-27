import { ConsoleLogger, Injectable } from '@nestjs/common';
import { RedisTransport } from 'src/modules/logger/transports/redis.transport';
import { createLogger, format, Logger } from 'winston';

@Injectable()
export class WinstonLogger extends ConsoleLogger {
  private readonly logger: Logger;

  constructor(private readonly redisTransport: RedisTransport) {
    super();
    this.logger = createLogger({
      format: format.json(),
      transports: [this.redisTransport],
    });
  }

  log(message: string, context?: unknown, ...rest: unknown[]): void {
    super.log(message, context, ...rest);
    this.logger.info(message, ...rest);
  }

  error(
    message: string,
    stack?: unknown,
    context?: unknown,
    ...rest: unknown[]
  ): void {
    super.error(message, stack, context, ...rest);
    this.logger.error(message, ...rest);
  }

  warn(message: string, context?: unknown, ...rest: unknown[]): void {
    super.warn(message, context, ...rest);
    this.logger.warn(message, ...rest);
  }

  debug(message: string, context?: unknown, ...rest: unknown[]): void {
    super.debug(message, context, ...rest);
    this.logger.debug(message, ...rest);
  }

  verbose(message: string, context?: unknown, ...rest: unknown[]): void {
    super.verbose(message, context, ...rest);
    this.logger.verbose(message, ...rest);
  }

  fatal(message: string, context?: unknown, ...rest: unknown[]): void {
    super.fatal(message, context, ...rest);
    this.logger.emerg(message, ...rest);
  }
}
