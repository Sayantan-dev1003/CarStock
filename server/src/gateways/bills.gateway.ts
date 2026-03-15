import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: '*', // tighten in production
  },
  namespace: '/bills',
})
export class BillsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BillsGateway.name);

  constructor(private redisService: RedisService) {}

  onModuleInit() {
    // Subscribe to bill.completed
    this.redisService.subscribe('bill.completed', (message) => {
      try {
        const data = JSON.parse(message);
        this.logger.log(`Emitting bill:updated for billId ${data.billId}`);
        this.server.to(`bill:${data.billId}`).emit('bill:updated', data);
      } catch (error) {
        this.logger.error('Error handling bill.completed event', error);
      }
    });

    // Subscribe to bill.failed
    this.redisService.subscribe('bill.failed', (message) => {
      try {
        const data = JSON.parse(message);
        this.logger.warn(`Emitting bill:failed for billId ${data.billId}`);
        this.server.to(`bill:${data.billId}`).emit('bill:failed', data);
      } catch (error) {
        this.logger.error('Error handling bill.failed event', error);
      }
    });
  }

  @SubscribeMessage('join-bill-room')
  handleJoinRoom(
    @MessageBody() data: { billId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data && data.billId) {
      client.join(`bill:${data.billId}`);
      this.logger.log(`Client ${client.id} joined room bill:${data.billId}`);
    }
  }

  @SubscribeMessage('leave-bill-room')
  handleLeaveRoom(
    @MessageBody() data: { billId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data && data.billId) {
      client.leave(`bill:${data.billId}`);
      this.logger.log(`Client ${client.id} left room bill:${data.billId}`);
    }
  }
}
