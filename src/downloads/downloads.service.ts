import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Download } from './entities/download.entity';
import { Repository } from 'typeorm';
import { YtDlpService } from './yt-dlp/yt-dlp.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface DownloadItem {
  id: string;
  url: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
}

@Injectable()
export class DownloadsService {
  constructor(
    @InjectRepository(Download)
    private readonly downloadRepository: Repository<Download>,
    private ytDlpService: YtDlpService,

    @InjectQueue('downloads')
    private downloadsQueue: Queue,
  ) {}

  async addDownload(url: string, userId: string) {
    const metadata = await this.ytDlpService.fetchMetadata(url);

    const newDownload = this.downloadRepository.create({
      url,
      userId,
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      status: 'pending',
    });
    // here the heavy lifting is sent to Redis Queue, the worker of downloads.processor.ts will pick it automatically
    const savedDownload = await this.downloadRepository.save(newDownload);

    await this.downloadsQueue.add('process-video', {
      url: savedDownload.url,
      downloadId: savedDownload.id,
    });

    return savedDownload;
  }

  async getDownloads(userId: string) {
    return await this.downloadRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
