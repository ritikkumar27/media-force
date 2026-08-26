import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { YtDlpService } from './yt-dlp/yt-dlp.service';
import { Download } from './entities/download.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Processor('downloads')
export class DownloadsProcessor extends WorkerHost {
  private readonly logger = new Logger(DownloadsProcessor.name);

  constructor(
    private readonly ytDlpService: YtDlpService,

    @InjectRepository(Download)
    private downloadRepository: Repository<Download>,
  
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Worker picked up Job ${job.id}! URL: ${job.data.url}`);
    // try {
    //   // Execute the download
    //   await this.ytDlpService.executeDownload(
    //     job.data.url,
    //     job.data.downloadId,
    //     async (progressPercentage) => {
    //       // instantly save progress to Redis. API/WebSockets can read this later
    //       await job.updateProgress(progressPercentage);
    //       this.logger.debug(`Job ${job.id} Progress: ${progressPercentage}%`);
    //     },
    //   );

    //   await this.downloadRepository.update(job.data.downloadId, {
    //     status: 'completed'
    //   });


    //   this.logger.log(`Job ${job.id} completed successfully! Database updated.`);

    try{
      const metadata = await this.ytDlpService.fetchMetadata(job.data.url);

      await this.downloadRepository.update(job.data.downloadId, {
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        status: 'downloading'
      });

      await this.ytDlpService.executeDownload(
        job.data.url,
        job.data.downloadId,
        job.data.quality,
        async (progressPercentage) => {
          await job.updateProgress(progressPercentage);
          this.logger.debug(`Job ${job.id} Progress: ${progressPercentage}%`);
        },
      );

      await this.downloadRepository.update(job.data.downloadId, {
        status: 'completed'
      });

      this.logger.log(`Job ${job.id} completed successfully!`);

    } catch (error) {

      await this.downloadRepository.update(job.data.downloadId, {
        status: 'failed',
      });

      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Job ${job.id} failed: ${message}`);
      throw error;
    }
  }
}
