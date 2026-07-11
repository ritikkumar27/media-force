import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import {
  QueueEventsHost,
  QueueEventsListener,
  OnQueueEvent,
} from '@nestjs/bullmq';
import { Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsGuard } from 'src/auth/ws.guard';


@UseGuards(WsGuard)
@WebSocketGateway({ cors: true })
@QueueEventsListener('downloads')
export class DownloadsGateway extends QueueEventsHost {


  private readonly logger = new Logger(DownloadsGateway.name);


  @WebSocketServer()
  server: Server;

  //triggers everytime our worker calls job.updateProgress()
  @OnQueueEvent('progress')
  onProgress({ jobId, data }: { jobId: string; data: number | string }) {
    const eventName = `download-progress-${jobId}`;

    this.server.emit(eventName, data);

    // this.server.emit('global-progress', {jobId, data}); // remove : for socket io testing remove in production

    this.logger.debug(`Broadcasted ${data}% for Job ${jobId}`);
  }
}
