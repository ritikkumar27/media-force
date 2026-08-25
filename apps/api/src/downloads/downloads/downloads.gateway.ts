import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';

import {
  QueueEventsHost,
  QueueEventsListener,
  OnQueueEvent,
} from '@nestjs/bullmq';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsGuard } from '../../auth/ws.guard';
import { JwtService } from '@nestjs/jwt';


@UseGuards(WsGuard)

@WebSocketGateway({ cors: true })
@QueueEventsListener('downloads')
export class DownloadsGateway extends QueueEventsHost implements OnGatewayConnection {


  private readonly logger = new Logger(DownloadsGateway.name);

  constructor(private jwtService: JwtService) {
    super();
  }

  @WebSocketServer()
  server!: Server;

  async handleConnection(client: Socket) {
    try {
      // 1. Extract token from either the 'auth' object (preferred for websockets) or headers
      const authHeader = client.handshake.headers.authorization;
      const token = client.handshake.auth?.token || (authHeader ? authHeader.split(' ')[1] : undefined);

      if (!token) {
        throw new Error('No token provided for WebSocket');
      }

      // 2. Verify the token using JwtService
      const payload = await this.jwtService.verifyAsync(token);
      
      // 3. Attach the user payload to the socket for future use
      client['user'] = payload;
      this.logger.debug(`Client authenticated and connected securely: ${client.id}`);

    } catch (error) {
      this.logger.error(`Unauthorized connection attempt. Disconnecting client ${client.id} - ${error.message}`);
      client.disconnect(); // Reject the connection
    }
  }

  //triggers everytime our worker calls job.updateProgress()
  @OnQueueEvent('progress')
  onProgress({ jobId, data }: { jobId: string; data: number | string }) {
    const eventName = `download-progress-${jobId}`;

    this.server.emit(eventName, data);

    // this.server.emit('global-progress', {jobId, data}); // remove : for socket io testing remove in production

    this.logger.debug(`Broadcasted ${data}% for Job ${jobId}`);
  }


  @UseGuards(WsGuard)
  @SubscribeMessage('subscribeToJob')
  handleSubscribeToJob(
    @MessageBody() jobId: string,
    @ConnectedSocket() client: Socket
  ){

    const roomName = `job-room-${jobId}`;
    client.join(roomName);

    this.logger.debug(`Client ${client.id} joined room: ${roomName}`);

    return {status: 'Subscribed successfully'};



  }
}
