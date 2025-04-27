import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { LoggingEvent } from 'src/modules/logger/types/redis-events';
import { RedisService } from 'src/modules/shared/services/redis.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LoggerGateway implements OnGatewayInit {
  constructor(private readonly redisService: RedisService) {}

  async afterInit(server: Server) {
    const client = await this.redisService.getClient();

    await client.subscribe(LoggingEvent, (message) => {
      server.emit(LoggingEvent, message);
    });
  }
}
