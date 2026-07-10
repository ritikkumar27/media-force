import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { YtDlpService } from './yt-dlp/yt-dlp.service';

@Processor('downloads')
export class DownloadsProcessor extends WorkerHost {
  private readonly logger = new Logger(DownloadsProcessor.name);

  constructor(private readonly ytDlpService: YtDlpService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Worker picked up Job ${job.id}! URL: ${job.data.url}`);
    try {
      // Execute the download
      await this.ytDlpService.executeDownload(
        job.data.url,
        job.data.downloadId,
        async (progressPercentage) => {
          // instantly save progress to Redis. API/WebSockets can read this later
          await job.updateProgress(progressPercentage);
          this.logger.debug(`Job ${job.id} Progress: ${progressPercentage}%`);
        },
      );
      this.logger.log(`Job ${job.id} completed successfully!`);
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error.message);
      throw error;
    }
  }
}
