import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Download } from './entities/download.entity';
import { Repository } from 'typeorm';
import { YtDlpService } from './yt-dlp/yt-dlp.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotFoundError } from 'rxjs';
import path from 'path';
import fs from 'fs';

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
    }, {
      jobId: savedDownload.id, //forcing bullmq to use our databse uuid for job id

    });

    return savedDownload;
  }

  async getDownloads(userId: string) {
    return await this.downloadRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getMetadata(url: string){
    try{
      const metadata = await this.ytDlpService.fetchMetadata(url);
      return {
        title: metadata.title,
        thumbnail: metadata.thumbnail,
      };
    } catch (error) {
      throw new Error('Failed to fetch video metadata');
    }
  }

  async getFileStream(downloadId: string, userId: string){

    const download = await this.downloadRepository.findOne({
      where: {id: downloadId}
    });

    if (!download) throw new NotFoundException('Download not found');
    if (download.userId !== userId) throw new UnauthorizedException('Not your file!');
    if (download.status !== 'completed') throw new NotFoundException('File not ready');

    const storageDir = path.resolve(process.cwd(), 'storage');
    const files = fs.readdirSync(storageDir);

    //shorthand arrow function
    const downloadedFile = files.find(
      file => file.startsWith(downloadId)); 
      

    if (!downloadedFile) {
      throw new NotFoundException('File is missing from the server hard drive');
    }

    const filePath = path.join(storageDir, downloadedFile);

    const stream = fs.createReadStream(filePath);
    const extension = path.extname(downloadedFile);

    return {
      stream,

      filename: `${download.title}${extension}`
    };



  }
}
