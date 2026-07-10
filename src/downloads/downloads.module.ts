import { Module } from '@nestjs/common';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Download } from './entities/download.entity';
import { YtDlpService } from './yt-dlp/yt-dlp.service';

@Module({

  imports: [TypeOrmModule.forFeature([Download])],
  controllers: [DownloadsController],
  providers: [DownloadsService, YtDlpService]
})
export class DownloadsModule {}
