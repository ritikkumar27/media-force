import { Module } from '@nestjs/common';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Download } from './entities/download.entity';
import { YtDlpService } from './yt-dlp/yt-dlp.service';
import { BullModule } from '@nestjs/bullmq';
import { DownloadsProcessor } from './downloads.processor';
import { DownloadsGateway } from './downloads/downloads.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Download]),

    BullModule.registerQueue({
      name: 'downloads',
    }),
  ],
  controllers: [DownloadsController],
  providers: [DownloadsService, YtDlpService, DownloadsProcessor, DownloadsGateway],
})
export class DownloadsModule {}
